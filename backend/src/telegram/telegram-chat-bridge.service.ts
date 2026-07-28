import { forwardRef, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { ChatService } from '../chat/chat.service';
import { MediaService } from '../media/media.service';

type TelegramPhotoSize = {
  file_id: string;
  file_unique_id?: string;
  width: number;
  height: number;
  file_size?: number;
};

type TelegramMessage = {
  message_id: number;
  message_thread_id?: number;
  from?: { id: number; is_bot?: boolean; first_name?: string; last_name?: string; username?: string };
  chat: { id: number; type: string; title?: string };
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  video?: { file_id: string; file_name?: string; mime_type?: string; file_size?: number };
  reply_to_message?: TelegramMessage;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

@Injectable()
export class TelegramChatBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramChatBridgeService.name);
  private updateOffset = 0;
  private polling = false;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ChatService)) private readonly chat: ChatService,
    private readonly media: MediaService,
  ) {}

  onModuleInit() {
    if (!this.isEnabled()) return;
    this.polling = true;
    this.schedulePoll(750);
    this.logger.log('Telegram client chat bridge polling enabled');
  }

  onModuleDestroy() {
    this.polling = false;
    if (this.timer) clearTimeout(this.timer);
  }

  private isEnabled() {
    const mode = this.config.get<string>('TELEGRAM_CHAT_BRIDGE_ENABLE', 'true');
    if (mode === 'false') return false;
    if (!this.isRealValue(this.botToken())) {
      this.logger.warn('Telegram chat bridge disabled: TELEGRAM_CHAT_BOT_TOKEN is not set or placeholder');
      return false;
    }
    if (!this.isRealValue(this.chatGroupId())) {
      this.logger.warn('Telegram chat bridge disabled: TELEGRAM_CHAT_GROUP_ID is not set or placeholder');
      return false;
    }
    return true;
  }

  private schedulePoll(delayMs: number) {
    if (!this.polling) return;
    this.timer = setTimeout(() => void this.pollOnce(), delayMs);
  }

  private async pollOnce() {
    try {
      const response = await this.postTelegram<{ result?: TelegramUpdate[] }>('getUpdates', {
        offset: this.updateOffset || undefined,
        timeout: 20,
        allowed_updates: ['message'],
      });

      const updates = response.result ?? [];
      for (const update of updates) {
        this.updateOffset = Math.max(this.updateOffset, update.update_id + 1);
        if (update.message) await this.handleMessage(update.message);
      }

      this.schedulePoll(250);
    } catch (error) {
      this.logger.warn(`Telegram chat bridge polling failed: ${error instanceof Error ? error.message : String(error)}`);
      this.schedulePoll(3000);
    }
  }

  private async handleMessage(message: TelegramMessage) {
    const groupId = Number(this.chatGroupId());
    if (!Number.isFinite(groupId) || message.chat.id !== groupId) return;
    if (message.from?.is_bot) return;

    const topicId = message.message_thread_id ?? message.reply_to_message?.message_thread_id;
    const roomId = (await this.chat.findRoomIdByTelegramTopicId(topicId)) || (await this.chat.findRoomIdByTelegramMessageId(message.reply_to_message?.message_id ?? 0));
    if (!roomId) {
      if (message.text?.trim() === '/help') {
        await this.sendText(
          message.chat.id,
          'Ответы клиентам пишите только внутри темы клиента. Формат темы: 👤 Имя · телефон.',
          topicId,
        );
      }
      return;
    }

    const adminName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') || message.from?.username || 'Администратор';
    const text = (message.text || message.caption || '').trim();

    if (message.photo && message.photo.length > 0) {
      const bestPhoto = [...message.photo].sort((a, b) => (b.file_size ?? b.width * b.height) - (a.file_size ?? a.width * a.height))[0];
      const saved = await this.downloadTelegramFile(bestPhoto.file_id, 'telegram-reply.jpg');
      await this.chat.createTelegramAdminReply({ roomId, adminId: String(message.from?.id ?? 'telegram-admin'), adminName, text: text || 'Фото от администратора', mediaUrl: saved.url, mediaType: 'photo' });
      return;
    }

    if (message.video) {
      const saved = await this.downloadTelegramFile(message.video.file_id, message.video.file_name || 'telegram-reply.mp4');
      await this.chat.createTelegramAdminReply({ roomId, adminId: String(message.from?.id ?? 'telegram-admin'), adminName, text: text || 'Видео от администратора', mediaUrl: saved.url, mediaType: 'video' });
      return;
    }

    if (!text) return;
    await this.chat.createTelegramAdminReply({
      roomId,
      adminId: String(message.from?.id ?? 'telegram-admin'),
      adminName,
      text,
    });
  }

  private async downloadTelegramFile(fileId: string, fallbackName: string) {
    const fileResponse = await this.postTelegram<{ result?: { file_path?: string } }>('getFile', { file_id: fileId });
    const filePath = fileResponse.result?.file_path;
    if (!filePath) throw new Error('Telegram did not return file_path');

    const url = `https://api.telegram.org/file/bot${this.botToken()}/${filePath}`;
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer', timeout: 25_000 });
    const mimeType = response.headers['content-type']?.toString() || 'application/octet-stream';
    const originalName = filePath.split('/').pop() || fallbackName;
    return this.media.saveChatBufferFile({ originalName, buffer: Buffer.from(response.data), mimeType });
  }

  private async sendText(chatId: number, text: string, threadId?: number) {
    const payload: Record<string, unknown> = { chat_id: chatId, text, disable_web_page_preview: true };
    if (threadId) payload.message_thread_id = threadId;
    await this.postTelegram('sendMessage', payload).catch(() => undefined);
  }

  private async postTelegram<T = Record<string, unknown>>(method: string, payload: Record<string, unknown>): Promise<T> {
    const response = await axios.post<T>(`https://api.telegram.org/bot${this.botToken()}/${method}`, payload, { timeout: 25_000, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    return response.data;
  }

  private botToken() {
    return (this.config.get<string>('TELEGRAM_CHAT_BOT_TOKEN') || '').trim();
  }

  private chatGroupId() {
    return (this.config.get<string>('TELEGRAM_CHAT_GROUP_ID') || '').trim();
  }

  private isRealValue(value?: string) {
    const text = value?.trim() ?? '';
    if (!text) return false;
    if (text.startsWith('put_')) return false;
    if (text.includes('your-') || text.includes('your_')) return false;
    if (text.includes('_here')) return false;
    return true;
  }
}

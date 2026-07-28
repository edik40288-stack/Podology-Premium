import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import FormData = require("form-data");
import { existsSync, createReadStream, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

import { ChatService } from "../chat/chat.service";

export type TelegramChatNotification = {
  roomId: string;
  senderId: string;
  senderName?: string;
  senderPhone?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  createdAt: string;
};

type TelegramClientActionNotification = {
  roomId: string;
  clientName?: string;
  clientPhone?: string;
  title: string;
  lines?: string[];
  footer?: string;
};

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ChatService)) private readonly chat: ChatService,
  ) {}

  get isEnabled() {
    return (
      this.config.get<string>("TELEGRAM_ENABLE_NOTIFICATIONS", "true") !==
      "false"
    );
  }

  async notifySystemEvent(input: { title: string; lines?: string[] }) {
    if (!this.systemEventsEnabled) return { skipped: true, reason: "system_events_disabled" };

    const title = this.escapeHtml(input.title.trim() || "Событие приложения");
    const lines = (input.lines ?? [])
      .map((line) => `• ${this.escapeHtml(line)}`)
      .join("\n");
    const text = [`🔔 <b>${title}</b>`, lines].filter(Boolean).join("\n\n");

    const results: unknown[] = [];
    const adminToken = (
      this.config.get<string>("TELEGRAM_ADMIN_BOT_TOKEN") || ""
    ).trim();
    const adminIds = (this.config.get<string>("TELEGRAM_ADMIN_IDS") || "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => this.isRealValue(item));

    if (this.isRealValue(adminToken) && adminIds.length > 0) {
      for (const adminId of adminIds) {
        try {
          const response = await axios.post(
            `${this.telegramApiBaseUrl(adminToken)}/sendMessage`,
            {
              chat_id: adminId,
              text,
              parse_mode: "HTML",
              disable_web_page_preview: true,
            },
            {
              timeout: 12_000,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            },
          );
          results.push(response.data);
        } catch (error) {
          this.logger.warn(
            `Telegram admin event failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    return { ok: results.length > 0, sent: results.length };
  }

  async notifyClientActionEvent(input: TelegramClientActionNotification) {
    if (!this.isEnabled) return { skipped: true, reason: "disabled" };

    const token = this.chatBotToken();
    const chatId = this.chatGroupId();
    if (!this.isRealValue(token) || !this.isRealValue(chatId)) {
      this.logger.warn(
        "Telegram client action skipped: TELEGRAM_CHAT_BOT_TOKEN or TELEGRAM_CHAT_GROUP_ID is not set",
      );
      return { skipped: true, reason: "missing_chat_env" };
    }

    const apiUrl = this.telegramApiBaseUrl(token);
    const topic = await this.resolveTopic(apiUrl, chatId, {
      roomId: input.roomId,
      senderId: "system",
      senderName: input.clientName || "Клиент",
      senderPhone: input.clientPhone,
      createdAt: new Date().toISOString(),
    });

    if (this.chatTopicsRequired && !topic.topicId) {
      this.logger.warn(
        `Telegram client action skipped: topic was not created for room ${input.roomId}`,
      );
      return { skipped: true, reason: "topic_not_created" };
    }

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: this.buildClientActionText(input),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };
    if (topic.topicId) payload.message_thread_id = topic.topicId;

    try {
      const result = await this.post(`${apiUrl}/sendMessage`, payload);
      return {
        ...result,
        telegramTopicId: topic.topicId ?? null,
        telegramTopicName: topic.topicName,
      };
    } catch (error) {
      this.logger.warn(
        `Telegram client action failed: ${this.telegramErrorSummary(error)}`,
      );
      return { skipped: true, reason: "telegram_error" };
    }
  }

  async notifyNewClientMessage(message: TelegramChatNotification) {
    if (!this.isEnabled) return { skipped: true, reason: "disabled" };

    const token = this.chatBotToken();
    const chatId = this.chatGroupId();

    if (!this.isRealValue(token) || !this.isRealValue(chatId)) {
      this.logger.warn(
        "Telegram chat notification skipped: TELEGRAM_CHAT_BOT_TOKEN or TELEGRAM_CHAT_GROUP_ID is not set",
      );
      return { skipped: true, reason: "missing_chat_env" };
    }

    const apiUrl = this.telegramApiBaseUrl(token);
    const topic = await this.resolveTopic(apiUrl, chatId, message);
    if (this.chatTopicsRequired && !topic.topicId) {
      this.logger.warn(
        `Telegram chat notification skipped: topic was not created for room ${message.roomId}`,
      );
      return { skipped: true, reason: "topic_not_created" };
    }
    const caption = this.buildCaption(message);
    const basePayload: Record<string, unknown> = {
      chat_id: chatId,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };

    if (topic.topicId) basePayload.message_thread_id = topic.topicId;

    try {
      let result: { ok: true; telegramMessageId: number | null };
      if (message.mediaUrl && message.mediaType === "photo") {
        result = await this.postMedia(
          `${apiUrl}/sendPhoto`,
          basePayload,
          "photo",
          message.mediaUrl,
          caption,
        );
      } else if (message.mediaUrl && message.mediaType === "video") {
        result = await this.postMedia(
          `${apiUrl}/sendVideo`,
          basePayload,
          "video",
          message.mediaUrl,
          caption,
        );
      } else {
        result = await this.post(`${apiUrl}/sendMessage`, {
          ...basePayload,
          text: caption,
        });
      }

      return {
        ...result,
        telegramTopicId: topic.topicId ?? null,
        telegramTopicName: topic.topicName,
      };
    } catch (error) {
      this.logger.error(
        `Telegram chat notification failed: ${this.telegramErrorSummary(error)}`,
      );
      return { skipped: true, reason: "telegram_error" };
    }
  }

  async retryUndeliveredClientMessages() {
    return this.chat.retryUndeliveredTelegramMessages();
  }

  async sendTestMessage() {
    return this.notifyNewClientMessage({
      roomId: "test-room",
      senderId: "system",
      senderName: "Тест приложения",
      text: "Проверка чат-бота: сообщение из приложения дошло в Telegram-группу с чатами клиентов.",
      createdAt: new Date().toISOString(),
    });
  }

  private async resolveTopic(
    apiUrl: string,
    chatId: string,
    message: TelegramChatNotification,
  ) {
    const topicsEnabled =
      this.config.get<string>("TELEGRAM_CHAT_TOPICS_ENABLED", "true") !==
      "false";
    const topicName = this.topicName(message);
    if (!topicsEnabled)
      return { topicId: undefined as number | undefined, topicName };

    const existingTopicId = await this.chat.findTelegramTopicIdByRoomId(
      message.roomId,
    );
    if (existingTopicId) return { topicId: existingTopicId, topicName };

    try {
      const response = await axios.post(
        `${apiUrl}/createForumTopic`,
        { chat_id: chatId, name: topicName.slice(0, 120) },
        {
          timeout: 15_000,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        },
      );
      const topicId = response.data?.result?.message_thread_id;
      if (typeof topicId === "number") {
        await this.chat.bindTelegramTopic(message.roomId, topicId, topicName);
        return { topicId, topicName };
      }
    } catch (error) {
      this.logger.warn(
        `Telegram topic was not created. Fallback to main chat. ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return { topicId: undefined as number | undefined, topicName };
  }

  private async post(url: string, payload: Record<string, unknown>) {
    const response = await axios.post(url, payload, {
      timeout: 12_000,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    return {
      ok: true as const,
      telegramMessageId: response.data?.result?.message_id ?? null,
    };
  }

  private async postMedia(
    url: string,
    basePayload: Record<string, unknown>,
    fieldName: "photo" | "video",
    mediaUrl: string,
    caption: string,
  ) {
    try {
      return await this.postPrimaryMedia(
        url,
        basePayload,
        fieldName,
        mediaUrl,
        caption,
      );
    } catch (error) {
      this.logger.warn(
        `Telegram ${fieldName} upload failed, trying sendDocument fallback: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.postPrimaryMedia(
        url.replace(/send(Photo|Video)$/i, "sendDocument"),
        basePayload,
        "document",
        mediaUrl,
        caption,
      );
    }
  }

  private async postPrimaryMedia(
    url: string,
    basePayload: Record<string, unknown>,
    fieldName: "photo" | "video" | "document",
    mediaUrl: string,
    caption: string,
  ) {
    const safeCaption = this.safeTelegramCaption(caption);
    const localPath = this.localMediaPath(mediaUrl);
    if (localPath && existsSync(localPath)) {
      const size = statSync(localPath).size;
      if (size <= 0)
        throw new Error(`Telegram media file is empty: ${localPath}`);
      const form = new FormData();
      for (const [key, value] of Object.entries(basePayload)) {
        if (value !== undefined && value !== null)
          form.append(key, String(value));
      }
      form.append(fieldName, createReadStream(localPath), {
        filename: basename(localPath),
        contentType: this.contentTypeForPath(localPath),
        knownLength: size,
      });
      form.append("caption", safeCaption);
      const response = await axios.post(url, form, {
        timeout: 120_000,
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      return {
        ok: true as const,
        telegramMessageId: response.data?.result?.message_id ?? null,
      };
    }

    const publicUrl = this.toPublicUrl(mediaUrl);
    if (!publicUrl.startsWith("http://") && !publicUrl.startsWith("https://")) {
      throw new Error(
        `Telegram media URL is not public and local file was not found: ${mediaUrl}`,
      );
    }

    const response = await axios.post(
      url,
      {
        ...basePayload,
        [fieldName]: publicUrl,
        caption: safeCaption,
      },
      {
        timeout: 30_000,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );
    return {
      ok: true as const,
      telegramMessageId: response.data?.result?.message_id ?? null,
    };
  }

  private localMediaPath(url: string) {
    const clean = this.localMediaPathPart(url);
    const chatPrefix = "/media/public/chat/";
    const contentPrefix = "/media/public/content/";
    if (clean.startsWith(chatPrefix))
      return join(
        process.cwd(),
        "storage",
        "chat",
        clean.slice(chatPrefix.length),
      );
    if (clean.startsWith(contentPrefix))
      return join(
        process.cwd(),
        "storage",
        "content",
        clean.slice(contentPrefix.length),
      );
    return null;
  }

  private localMediaPathPart(url: string) {
    const clean = url.split("?")[0];
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        return new URL(clean).pathname;
      } catch {
        return clean;
      }
    }
    return clean;
  }

  private safeTelegramCaption(value: string) {
    return value.length > 1000 ? `${value.slice(0, 997)}...` : value;
  }

  private contentTypeForPath(path: string) {
    const ext = extname(path).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".png") return "image/png";
    if (ext === ".webp") return "image/webp";
    if (ext === ".gif") return "image/gif";
    if (ext === ".mp4") return "video/mp4";
    if (ext === ".mov") return "video/quicktime";
    return "application/octet-stream";
  }

  private buildCaption(message: TelegramChatNotification) {
    const senderName = this.escapeHtml(
      message.senderName || "Клиент приложения",
    );
    const senderPhone = message.senderPhone
      ? `
Телефон: <b>${this.escapeHtml(message.senderPhone)}</b>`
      : "";
    const text = message.text?.trim()
      ? `

<b>Сообщение:</b>
${this.escapeHtml(message.text.trim())}`
      : "";
    const title = message.mediaUrl
      ? message.mediaType === "video"
        ? "🎥 <b>Видео от клиента</b>"
        : "📷 <b>Фото от клиента</b>"
      : "💬 <b>Новое сообщение от клиента</b>";

    return `${title}

Клиент: <b>${senderName}</b>${senderPhone}${text}

Ответьте обычным сообщением прямо здесь — клиент увидит ответ в приложении.`;
  }

  private buildClientActionText(input: TelegramClientActionNotification) {
    const clientName = this.escapeHtml(input.clientName || "Клиент");
    const clientPhone = input.clientPhone
      ? `
Телефон: <b>${this.escapeHtml(input.clientPhone)}</b>`
      : "";
    const lines = (input.lines ?? [])
      .map((line) => `• ${this.escapeHtml(line)}`)
      .join("\n");
    const body = lines ? `

${lines}` : "";
    const footer = input.footer ?? "Ответьте в этой теме, если нужно связаться с клиентом.";
    return `${this.escapeHtml(input.title)}

Клиент: <b>${clientName}</b>${clientPhone}${body}

${this.escapeHtml(footer)}`;
  }

  private topicName(message: TelegramChatNotification) {
    const senderName = this.cleanTopicPart(message.senderName || "Клиент");
    const phone = this.cleanTopicPart(message.senderPhone || "");
    const suffix = phone || this.cleanTopicPart(message.roomId.slice(0, 12));
    return `👤 ${senderName} · ${suffix}`.slice(0, 120);
  }

  private cleanTopicPart(value: string) {
    return value.replace(/\s+/g, " ").trim() || "Клиент";
  }

  private get chatTopicsRequired() {
    return this.config.get<string>("TELEGRAM_CHAT_REQUIRE_TOPICS", "true") !== "false";
  }

  private get systemEventsEnabled() {
    return this.config.get<string>("TELEGRAM_SYSTEM_EVENTS_TO_TELEGRAM", "false") === "true";
  }

  private toPublicUrl(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const publicBaseUrl =
      this.config.get<string>("APP_PUBLIC_BASE_URL") ||
      this.config.get<string>("MEDIA_PUBLIC_BASE_URL") ||
      "";
    return `${publicBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  private telegramApiBaseUrl(token: string) {
    const base = (
      this.config.get<string>("TELEGRAM_BOT_API_BASE_URL") ||
      "https://api.telegram.org"
    ).replace(/\/$/, "");
    return `${base}/bot${token}`;
  }


  private chatBotToken() {
    return (this.config.get<string>("TELEGRAM_CHAT_BOT_TOKEN") || "").trim();
  }

  private chatGroupId() {
    return (this.config.get<string>("TELEGRAM_CHAT_GROUP_ID") || "").trim();
  }

  private telegramErrorSummary(error: unknown) {
    const candidate = error as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    const body =
      candidate.response?.data === undefined
        ? ""
        : ` body=${this.safeJson(candidate.response.data)}`;
    return [
      `status=${candidate.response?.status ?? "n/a"}`,
      candidate.message ? `message=${candidate.message}` : "",
      body,
    ]
      .filter(Boolean)
      .join(" ");
  }

  private safeJson(value: unknown) {
    try {
      const text = JSON.stringify(value);
      return text.length > 1000 ? `${text.slice(0, 1000)}...` : text;
    } catch {
      return String(value);
    }
  }

  private isRealValue(value?: string) {
    const text = value?.trim() ?? "";
    if (!text) return false;
    if (text.startsWith("put_")) return false;
    if (text.includes("your-") || text.includes("your_")) return false;
    if (text.includes("_here")) return false;
    return true;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

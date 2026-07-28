import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { ContentService } from '../content/content.service';
import type { ContentItem, HomeContentPayload, ItemFieldKey, ItemSectionKey, TextFieldKey } from '../content/types';
import { itemSectionLabels, textFieldLabels } from '../content/types';
import { MediaService } from '../media/media.service';
import type { AdminSession, InlineButton, InlineKeyboardMarkup, SectionAlias, TextAlias, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './telegram-admin.types';
import { sectionAliasByKey, sectionMap, textFieldMap } from './telegram-admin.maps';

type WizardStep = {
  field: ItemFieldKey | 'photo';
  label: string;
  prompt: string;
  optional?: boolean;
};

@Injectable()
export class TelegramAdminService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramAdminService.name);
  private readonly sessions = new Map<number, AdminSession>();
  private updateOffset = 0;
  private polling = false;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly config: ConfigService,
    private readonly content: ContentService,
    private readonly media: MediaService,
  ) {}

  onModuleInit() {
    if (!this.isEnabled()) return;
    this.polling = true;
    this.schedulePoll(750);
    this.logger.log('Telegram admin content bot polling enabled');
  }

  onModuleDestroy() {
    this.polling = false;
    if (this.timer) clearTimeout(this.timer);
  }

  private isEnabled() {
    const token = this.botToken();
    const admins = this.adminIds();
    const mode = this.config.get<string>('TELEGRAM_ADMIN_ENABLE', 'true');
    if (mode === 'false') return false;
    if (!this.isRealValue(token)) {
      this.logger.warn('Telegram admin bot disabled: TELEGRAM_ADMIN_BOT_TOKEN is not set or placeholder');
      return false;
    }
    if (admins.size === 0) {
      this.logger.warn('Telegram admin bot disabled: TELEGRAM_ADMIN_IDS is not set or placeholder');
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
        allowed_updates: ['message', 'callback_query'],
      });
      for (const update of response.result ?? []) {
        this.updateOffset = Math.max(this.updateOffset, update.update_id + 1);
        await this.handleUpdate(update);
      }
      this.schedulePoll(250);
    } catch (error) {
      this.logger.warn(`Telegram admin polling failed: ${error instanceof Error ? error.message : String(error)}`);
      this.schedulePoll(3000);
    }
  }

  private async handleUpdate(update: TelegramUpdate) {
    if (update.callback_query) return this.handleCallback(update.callback_query);
    if (update.message) return this.handleMessage(update.message);
  }

  private async handleCallback(callback: TelegramCallbackQuery) {
    const chatId = callback.message?.chat.id;
    const userId = callback.from.id;
    const data = callback.data ?? '';
    await this.answerCallback(callback.id);

    if (!chatId || !this.isAdmin(userId)) {
      if (chatId) await this.sendText(chatId, 'Нет доступа. Этот бот только для владельца приложения.');
      return;
    }

    if (data === 'menu') {
      this.sessions.delete(userId);
      return this.showMainMenu(chatId);
    }
    if (data === 'preview') return this.showPreview(chatId);
    if (data === 'help') return this.showHelp(chatId);
    if (data === 'confirm') return this.commitPendingSession(userId, chatId);
    if (data === 'discard') return this.discardPendingSession(userId, chatId);
    if (data === 'skip_photo') return this.skipWizardPhoto(userId, chatId);
    if (data === 'address') {
      this.sessions.delete(userId);
      return this.showAddressMenu(chatId);
    }
    if (data === 'txt:xaddr' || data === 'txt:xmap' || data.startsWith('txtsec:')) return this.askTextField(userId, chatId, data.replace('txtsec:', ''));
    if (data.startsWith('txt:')) return this.askTextField(userId, chatId, data.slice(4));
    if (data.startsWith('bg:')) return this.askBackgroundPhoto(userId, chatId, data.slice(3));
    if (data.startsWith('sec:')) {
      this.sessions.delete(userId);
      return this.showSectionMenu(chatId, this.sectionFromAlias(data.slice(4)));
    }
    if (data.startsWith('list:')) return this.showItemsList(chatId, this.sectionFromAlias(data.slice(5)));
    if (data.startsWith('new:')) return this.startAddWizard(userId, chatId, this.sectionFromAlias(data.slice(4)));
    if (data.startsWith('item:')) return this.showItemMenu(chatId, data);
    if (data.startsWith('edit:')) return this.askEditItem(userId, chatId, data);
    if (data.startsWith('photo:')) return this.askReplaceItemPhoto(userId, chatId, data);
    if (data.startsWith('delask:')) return this.askDeleteItem(chatId, data);
    if (data.startsWith('delok:')) return this.deleteItem(chatId, data);
    if (data.startsWith('clearask:')) return this.askClearSection(chatId, this.sectionFromAlias(data.slice(9)));
    if (data.startsWith('clearok:')) return this.clearSection(chatId, this.sectionFromAlias(data.slice(8)));
    if (data.startsWith('move:')) return this.moveItem(chatId, data);

    return this.showMainMenu(chatId);
  }

  private async handleMessage(message: TelegramMessage) {
    const userId = message.from?.id;
    const chatId = message.chat.id;
    if (!userId || !this.isAdmin(userId)) {
      await this.sendText(chatId, 'Нет доступа.');
      return;
    }

    const text = message.text?.trim() ?? '';
    if (text === '/start' || text === '/admin' || text.toLowerCase() === 'меню') {
      this.sessions.delete(userId);
      return this.showMainMenu(chatId);
    }
    if (text === 'Отмена' || text === '/cancel') {
      this.sessions.delete(userId);
      return this.showMainMenu(chatId);
    }

    const session = this.sessions.get(userId);
    if (!session) {
      return this.sendText(chatId, 'Выбери раздел кнопками. Тут больше не нужно помнить сложные форматы — бот ведёт по шагам.', this.mainKeyboard());
    }

    if (session.kind === 'textFieldInput') return this.handleTextFieldInput(userId, chatId, session, text);
    if (session.kind === 'itemFieldInput') return this.handleItemFieldInput(userId, chatId, session, text);
    if (session.kind === 'addWizard') return this.handleAddWizardInput(userId, chatId, session, message);
    if (session.kind === 'replacePhotoInput') return this.handleReplacePhotoInput(userId, chatId, session, message);
    if (session.kind === 'backgroundPhotoInput') return this.handleBackgroundPhotoInput(userId, chatId, session, message);

    await this.sendText(chatId, 'Сначала нажми “Сохранить” или “Отмена” под предпросмотром.', this.confirmKeyboard());
  }

  private async showMainMenu(chatId: number) {
    await this.sendText(
      chatId,
      [
        'PODOLOG KUTSYTOI — простая админка',
        '',
        'Выбери, что хочешь изменить. Бот сам спросит нужные данные по шагам и перед сохранением покажет предпросмотр.',
        '',
        'Главное правило: ничего не сохраняется сразу. Сначала предпросмотр → потом кнопка “Сохранить”.',
      ].join('\n'),
      this.mainKeyboard(),
    );
  }

  private async showAddressMenu(chatId: number) {
    const home = await this.content.readHomeData();
    await this.sendText(
      chatId,
      [
        '📍 Адрес и карта',
        '',
        `Адрес в данных: ${home.expertBlock.address}`,
        `Ссылка карты: ${home.expertBlock.mapUrl || 'не указана'}`,
        '',
        'Важно: красивый верхний баннер — это дизайн-картинка. Через этот раздел меняется ссылка карты и данные приложения. Текст в самой картинке лучше менять отдельно, чтобы не ломать premium-вид.',
      ].join('\n'),
      {
        inline_keyboard: [
          [{ text: '📍 Изменить адрес', callback_data: 'txt:xaddr' }],
          [{ text: '🗺 Изменить ссылку карты', callback_data: 'txt:xmap' }],
          [{ text: '👀 Посмотреть что сейчас', callback_data: 'preview' }],
          [{ text: '⬅️ Главное меню', callback_data: 'menu' }],
        ],
      },
    );
  }

  private async showSectionMenu(chatId: number, section: ItemSectionKey) {
    const alias = sectionAliasByKey[section];
    const items = await this.content.listItems(section);
    const label = itemSectionLabels[section];
    const rows: InlineButton[][] = [
      [{ text: `👀 Посмотреть ${this.itemsWord(section)}`, callback_data: `list:${alias}` }],
      [{ text: `➕ Добавить ${this.itemWord(section)}`, callback_data: `new:${alias}` }],
    ];
    const textAliases = this.sectionTextAliases(section);
    if (textAliases) {
      rows.push([{ text: '✏️ Название раздела', callback_data: `txtsec:${textAliases.title}` }, { text: '📝 Описание раздела', callback_data: `txtsec:${textAliases.description}` }]);
    }
    rows.push([{ text: '🧹 Очистить раздел', callback_data: `clearask:${alias}` }]);
    rows.push([{ text: '⬅️ Главное меню', callback_data: 'menu' }]);

    await this.sendText(
      chatId,
      [`${this.sectionIcon(section)} ${label}`, '', `Сейчас элементов: ${items.length}`, '', 'Выбери действие кнопкой ниже.'].join('\n'),
      { inline_keyboard: rows },
    );
  }

  private async showItemsList(chatId: number, section: ItemSectionKey) {
    const alias = sectionAliasByKey[section];
    const items = await this.content.listItems(section);
    if (items.length === 0) return this.sendText(chatId, `Раздел “${itemSectionLabels[section]}” пуст.`, this.sectionKeyboard(alias));

    const lines = items.map((item, i) => `${i + 1}. ${this.itemListLine(section, item)}`).join('\n');
    const rows = items.map((item, i) => [{ text: `${i + 1}. ${this.short(item.title, 42)}`, callback_data: `item:${alias}:${i}` }]);
    rows.push([{ text: '⬅️ В раздел', callback_data: `sec:${alias}` }, { text: '🏠 Меню', callback_data: 'menu' }]);

    await this.sendText(chatId, [`${itemSectionLabels[section]} — список`, '', lines, '', 'Нажми на нужный элемент, чтобы изменить его.'].join('\n'), { inline_keyboard: rows });
  }

  private async showItemMenu(chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const items = await this.content.listItems(section);
    const item = items[index];
    if (!item) return this.showItemsList(chatId, section);

    const alias = sectionAliasByKey[section];
    const rows: InlineButton[][] = this.itemFields(section).map((field) => [{ text: this.itemFieldLabel(field), callback_data: `edit:${alias}:${index}:${field}` }]);
    if (this.itemSupportsPhoto(section)) rows.push([{ text: '🖼 Заменить фото', callback_data: `photo:${alias}:${index}` }]);
    rows.push([{ text: '⬆️ Выше', callback_data: `move:${alias}:${index}:up` }, { text: '⬇️ Ниже', callback_data: `move:${alias}:${index}:down` }]);
    rows.push([{ text: '🗑 Удалить', callback_data: `delask:${alias}:${index}` }]);
    rows.push([{ text: '⬅️ К списку', callback_data: `list:${alias}` }]);

    await this.sendText(chatId, this.itemPreview(section, item), { inline_keyboard: rows });
  }

  private async showPreview(chatId: number) {
    const s = await this.content.summary();
    await this.sendText(
      chatId,
      [
        'Сейчас в приложении:',
        '',
        `Бренд: ${s.brandName}`,
        `Адрес: ${s.address}`,
        '',
        `О центре: ${s.aboutBlocks}`,
        `Сертификаты: ${s.certificates}`,
        `Интерьер: ${s.interiorPhotos}`,
        `Работы: ${s.works}`,
        `Услуги: ${s.services}`,
        `Специалисты: ${s.specialists}`,
        '',
        'После изменения приложение обновляет контент через backend. Если телефон уже открыт — подожди несколько секунд или нажми обновление.',
      ].join('\n'),
      this.mainKeyboard(),
    );
  }

  private async showHelp(chatId: number) {
    await this.sendText(
      chatId,
      [
        'Как пользоваться админкой:',
        '',
        '1. Нажми /admin.',
        '2. Выбери раздел: услуги, сертификаты, специалист и т.д.',
        '3. Выбери элемент или нажми “Добавить”.',
        '4. Бот спросит данные по одному шагу.',
        '5. Перед сохранением появится предпросмотр.',
        '6. Нажми “Сохранить” или “Отмена”.',
        '',
        'Сложные строки через | больше не нужны. Ошибиться стало сложнее.',
      ].join('\n'),
      this.mainKeyboard(),
    );
  }

  private async askTextField(userId: number, chatId: number, alias: string) {
    const field = this.textFieldFromAlias(alias);
    const label = textFieldLabels[field];
    const current = this.getTextValue(await this.content.readHomeData(), field);
    this.sessions.set(userId, { kind: 'textFieldInput', field, label });
    await this.sendText(chatId, [`${label}`, '', `Сейчас: ${current || 'пусто'}`, '', 'Отправь новое значение одним сообщением.'].join('\n'), this.cancelKeyboard());
  }

  private async askBackgroundPhoto(userId: number, chatId: number, alias: string) {
    const field = this.textFieldFromAlias(alias);
    const label = textFieldLabels[field];
    this.sessions.set(userId, { kind: 'backgroundPhotoInput', field, label });
    await this.sendText(chatId, `${label}\n\nОтправь фото. Перед сохранением я покажу предпросмотр.`, this.cancelKeyboard());
  }

  private async askEditItem(userId: number, chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const field = (parts[3] ?? 'title') as ItemFieldKey;
    const items = await this.content.listItems(section);
    const item = items[index];
    if (!item) return this.showItemsList(chatId, section);
    const label = this.itemFieldLabel(field);
    this.sessions.set(userId, { kind: 'itemFieldInput', section, index, itemId: item.id, field, label });
    await this.sendText(chatId, [`${label}`, '', `Сейчас: ${this.fieldValue(item, field) || 'пусто'}`, '', 'Отправь новое значение одним сообщением.'].join('\n'), this.cancelKeyboard());
  }

  private async askReplaceItemPhoto(userId: number, chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const items = await this.content.listItems(section);
    const item = items[index];
    if (!item) return this.showItemsList(chatId, section);
    this.sessions.set(userId, { kind: 'replacePhotoInput', section, index, itemId: item.id, label: itemSectionLabels[section] });
    await this.sendText(chatId, `Замена фото\n\nЭлемент: ${item.title}\n\nОтправь новое фото. Перед сохранением я покажу предпросмотр.`, this.cancelKeyboard());
  }

  private async startAddWizard(userId: number, chatId: number, section: ItemSectionKey) {
    const label = itemSectionLabels[section];
    const session: AdminSession = { kind: 'addWizard', section, label, step: 0, draft: {} };
    this.sessions.set(userId, session);
    return this.askWizardStep(chatId, session);
  }

  private async handleTextFieldInput(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'textFieldInput' }>, text: string) {
    if (!text) return this.sendText(chatId, 'Нужен текст. Отправь новое значение.', this.cancelKeyboard());
    this.sessions.set(userId, { kind: 'confirmTextField', field: session.field, label: session.label, value: text });
    const current = this.getTextValue(await this.content.readHomeData(), session.field);
    await this.sendText(chatId, this.textFieldPreview(session.label, current, text), this.confirmKeyboard());
  }

  private async handleItemFieldInput(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'itemFieldInput' }>, text: string) {
    if (!text && session.field !== 'description') return this.sendText(chatId, 'Нужно значение. Отправь текст или нажми Отмена.', this.cancelKeyboard());
    const items = await this.content.listItems(session.section);
    const item = items.find((entry) => entry.id === session.itemId);
    if (!item) return this.sendText(chatId, 'Элемент не найден. Открой список заново.', this.sectionKeyboard(sectionAliasByKey[session.section]));
    this.sessions.set(userId, { kind: 'confirmItemField', section: session.section, index: session.index, itemId: session.itemId, field: session.field, label: session.label, value: text });
    await this.sendText(chatId, this.itemFieldPreview(session.section, item, session.field, session.label, text), this.confirmKeyboard());
  }

  private async handleAddWizardInput(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'addWizard' }>, message: TelegramMessage) {
    const steps = this.addSteps(session.section);
    const step = steps[session.step];
    if (!step) return this.previewAddDraft(userId, chatId, session);

    if (step.field === 'photo') {
      const text = message.text?.trim().toLowerCase() ?? '';
      if (text === 'пропустить' || text === 'skip') return this.previewAddDraft(userId, chatId, session);
      const imageUrl = await this.saveIncomingPhoto(message);
      if (!imageUrl) return this.sendText(chatId, 'Отправь фото или напиши “Пропустить”.', this.skipPhotoKeyboard());
      session.draft.imageUrl = imageUrl;
      return this.previewAddDraft(userId, chatId, session);
    }

    const value = message.text?.trim() ?? '';
    if (!value && !step.optional) return this.sendText(chatId, 'Нужен текст. Отправь значение или нажми Отмена.', this.cancelKeyboard());
    if (value && value.toLowerCase() !== 'пропустить') session.draft[step.field] = value;
    session.step += 1;
    this.sessions.set(userId, session);
    return this.askWizardStep(chatId, session);
  }

  private async handleReplacePhotoInput(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'replacePhotoInput' }>, message: TelegramMessage) {
    const imageUrl = await this.saveIncomingPhoto(message);
    if (!imageUrl) return this.sendText(chatId, 'Нужно отправить именно фото.', this.cancelKeyboard());
    this.sessions.set(userId, { kind: 'confirmReplacePhoto', section: session.section, index: session.index, itemId: session.itemId, label: session.label, imageUrl });
    await this.sendText(chatId, `Предпросмотр перед сохранением\n\nФото получено.\nРаздел: ${session.label}\n\nСохранить новое фото?`, this.confirmKeyboard());
  }

  private async handleBackgroundPhotoInput(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'backgroundPhotoInput' }>, message: TelegramMessage) {
    const imageUrl = await this.saveIncomingPhoto(message);
    if (!imageUrl) return this.sendText(chatId, 'Нужно отправить именно фото.', this.cancelKeyboard());
    this.sessions.set(userId, { kind: 'confirmBackgroundPhoto', field: session.field, label: session.label, imageUrl });
    await this.sendText(chatId, `Предпросмотр перед сохранением\n\n${session.label}\nФото получено.\n\nСохранить?`, this.confirmKeyboard());
  }

  private async askWizardStep(chatId: number, session: Extract<AdminSession, { kind: 'addWizard' }>) {
    const steps = this.addSteps(session.section);
    const step = steps[session.step];
    if (!step) return this.previewAddDraft(0, chatId, session);
    const header = `Добавление: ${this.itemWord(session.section)}\nШаг ${session.step + 1} из ${steps.length}`;
    if (step.field === 'photo') return this.sendText(chatId, `${header}\n\n${step.prompt}`, this.skipPhotoKeyboard());
    await this.sendText(chatId, `${header}\n\n${step.prompt}`, this.cancelKeyboard());
  }

  private async previewAddDraft(userId: number, chatId: number, session: Extract<AdminSession, { kind: 'addWizard' }>) {
    if (userId) this.sessions.set(userId, { kind: 'confirmAddItem', section: session.section, label: session.label, draft: session.draft });
    await this.sendText(chatId, [`Предпросмотр перед сохранением`, '', this.draftPreview(session.section, session.draft), '', 'Сохранить этот элемент?'].join('\n'), this.confirmKeyboard());
  }

  private async skipWizardPhoto(userId: number, chatId: number) {
    const session = this.sessions.get(userId);
    if (!session || session.kind !== 'addWizard') return this.showMainMenu(chatId);
    return this.previewAddDraft(userId, chatId, session);
  }

  private async commitPendingSession(userId: number, chatId: number) {
    const session = this.sessions.get(userId);
    if (!session) return this.showMainMenu(chatId);

    if (session.kind === 'confirmTextField') {
      await this.content.setTextField(session.field, session.value);
      this.sessions.delete(userId);
      return this.sendText(chatId, `Сохранено ✅\n${session.label}`, this.mainKeyboard());
    }

    if (session.kind === 'confirmItemField') {
      const item = await this.content.updateItem(session.section, session.itemId, { [session.field]: session.value });
      this.sessions.delete(userId);
      return this.sendText(chatId, item ? `Сохранено ✅\n${session.label}` : 'Элемент не найден.', this.sectionKeyboard(sectionAliasByKey[session.section]));
    }

    if (session.kind === 'confirmAddItem') {
      await this.content.addItem(session.section, session.draft);
      this.sessions.delete(userId);
      return this.sendText(chatId, `Сохранено ✅\nДобавлено в раздел “${session.label}”.`, this.sectionKeyboard(sectionAliasByKey[session.section]));
    }

    if (session.kind === 'confirmReplacePhoto') {
      const item = await this.content.updateItem(session.section, session.itemId, { imageUrl: session.imageUrl, asset: '' });
      this.sessions.delete(userId);
      return this.sendText(chatId, item ? 'Сохранено ✅\nФото заменено.' : 'Элемент не найден.', this.sectionKeyboard(sectionAliasByKey[session.section]));
    }

    if (session.kind === 'confirmBackgroundPhoto') {
      await this.content.setTextField(session.field, session.imageUrl);
      this.sessions.delete(userId);
      return this.sendText(chatId, `Сохранено ✅\n${session.label}`, this.mainKeyboard());
    }

    await this.sendText(chatId, 'Сейчас нечего сохранять.', this.mainKeyboard());
  }

  private async discardPendingSession(userId: number, chatId: number) {
    this.sessions.delete(userId);
    await this.sendText(chatId, 'Отменено. Ничего не сохранено.', this.mainKeyboard());
  }

  private async askDeleteItem(chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const item = (await this.content.listItems(section))[index];
    if (!item) return this.showItemsList(chatId, section);
    await this.sendText(chatId, `Удалить элемент?\n\n${this.itemPreview(section, item)}`, {
      inline_keyboard: [[{ text: '🗑 Да, удалить', callback_data: `delok:${parts[1]}:${index}` }], [{ text: '⬅️ Нет, назад', callback_data: `item:${parts[1]}:${index}` }]],
    });
  }

  private async deleteItem(chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const items = await this.content.listItems(section);
    const item = items[index];
    if (item) await this.content.deleteItem(section, item.id);
    await this.sendText(chatId, item ? `Удалено ✅\n${item.title}` : 'Элемент не найден.', this.sectionKeyboard(sectionAliasByKey[section]));
  }

  private async askClearSection(chatId: number, section: ItemSectionKey) {
    const alias = sectionAliasByKey[section];
    const items = await this.content.listItems(section);
    await this.sendText(chatId, `Очистить весь раздел “${itemSectionLabels[section]}”?\n\nЭлементов сейчас: ${items.length}\n\nЭто действие нельзя отменить.`, {
      inline_keyboard: [[{ text: '🧹 Да, очистить', callback_data: `clearok:${alias}` }], [{ text: '⬅️ Нет, назад', callback_data: `sec:${alias}` }]],
    });
  }

  private async clearSection(chatId: number, section: ItemSectionKey) {
    await this.content.clearSection(section);
    await this.sendText(chatId, `Раздел “${itemSectionLabels[section]}” очищен ✅`, this.sectionKeyboard(sectionAliasByKey[section]));
  }

  private async moveItem(chatId: number, data: string) {
    const parts = data.split(':');
    const section = this.sectionFromAlias(parts[1] ?? '');
    const index = Number(parts[2] ?? -1);
    const direction = parts[3] === 'up' ? -1 : 1;
    const items = await this.content.listItems(section);
    const targetIndex = index + direction;
    const current = items[index];
    const target = items[targetIndex];
    if (!current || !target) return this.sendText(chatId, 'Дальше двигать нельзя.', this.sectionKeyboard(sectionAliasByKey[section]));
    await this.content.updateItem(section, current.id, { sortOrder: target.sortOrder });
    await this.content.updateItem(section, target.id, { sortOrder: current.sortOrder });
    await this.sendText(chatId, `Порядок изменён ✅\n${current.title}`, this.sectionKeyboard(sectionAliasByKey[section]));
  }

  private addSteps(section: ItemSectionKey): WizardStep[] {
    if (section === 'services.items') {
      return [
        { field: 'subtitle', label: 'Категория', prompt: 'Напиши категорию услуги. Например: Подология' },
        { field: 'title', label: 'Название', prompt: 'Напиши название услуги.' },
        { field: 'description', label: 'Описание', prompt: 'Коротко опиши услугу: 1–2 предложения.' },
        { field: 'price', label: 'Цена', prompt: 'Напиши цену. Например: 4 500–6 000 ₽' },
        { field: 'duration', label: 'Время', prompt: 'Напиши время для приложения. Например: 100 мин' },
        { field: 'icon', label: 'Значок', prompt: 'Напиши один emoji/значок. Например: 🦶', optional: true },
      ];
    }
    if (section === 'specialists.items') {
      return [
        { field: 'title', label: 'Имя', prompt: 'Напиши имя специалиста.' },
        { field: 'role', label: 'Должность', prompt: 'Напиши должность. Например: Специалист-подолог' },
        { field: 'experience', label: 'Стаж', prompt: 'Напиши стаж. Например: Стаж 7 лет' },
        { field: 'description', label: 'Описание', prompt: 'Напиши описание специалиста.' },
        { field: 'photo', label: 'Фото', prompt: 'Отправь фото специалиста или нажми “Пропустить фото”.', optional: true },
      ];
    }
    if (section === 'profile.items') {
      return [
        { field: 'icon', label: 'Значок', prompt: 'Напиши ключ значка. Например: calendar, user, settings' },
        { field: 'title', label: 'Название', prompt: 'Напиши название пункта профиля.' },
        { field: 'description', label: 'Описание', prompt: 'Напиши короткое описание.' },
      ];
    }
    if (section === 'interior.panoramas') {
      return [
        { field: 'title', label: 'Название', prompt: 'Напиши название 360° обзора.' },
        { field: 'panoramaUrl', label: 'Ссылка', prompt: 'Вставь ссылку 360° обзора.' },
        { field: 'description', label: 'Описание', prompt: 'Напиши короткое описание.', optional: true },
      ];
    }
    return [
      { field: 'title', label: 'Название', prompt: 'Напиши название карточки.' },
      { field: 'description', label: 'Описание', prompt: 'Напиши описание карточки.' },
      { field: 'photo', label: 'Фото', prompt: 'Отправь фото для карточки или нажми “Пропустить фото”.', optional: true },
    ];
  }

  private itemFields(section: ItemSectionKey): ItemFieldKey[] {
    if (section === 'services.items') return ['subtitle', 'title', 'description', 'price', 'duration', 'icon'];
    if (section === 'specialists.items') return ['title', 'role', 'experience', 'description'];
    if (section === 'interior.panoramas') return ['title', 'panoramaUrl', 'description'];
    if (section === 'profile.items') return ['icon', 'title', 'description'];
    return ['title', 'description'];
  }

  private itemSupportsPhoto(section: ItemSectionKey) {
    return section !== 'services.items' && section !== 'profile.items' && section !== 'interior.panoramas';
  }

  private sectionTextAliases(section: ItemSectionKey): { title: TextAlias; description: TextAlias } | null {
    if (section === 'about.items') return { title: 'atitle', description: 'adesc' };
    if (section === 'certificates.items') return { title: 'ctitle', description: 'cdesc' };
    if (section === 'interior.items') return { title: 'ititle', description: 'idesc' };
    if (section === 'works.items') return { title: 'wtitle', description: 'wdesc' };
    if (section === 'services.items') return { title: 'stitle', description: 'sdesc' };
    if (section === 'specialists.items') return { title: 'ptitle', description: 'pdesc' };
    if (section === 'profile.items') return { title: 'rtitle', description: 'rdesc' };
    return null;
  }

  private itemFieldLabel(field: ItemFieldKey) {
    const labels: Record<ItemFieldKey, string> = {
      title: '✏️ Название / имя',
      subtitle: '🏷 Категория',
      description: '📄 Описание',
      imageUrl: '🖼 Ссылка на фото',
      asset: '🖼 Asset',
      icon: '🎯 Значок',
      price: '💰 Цена',
      duration: '⏱ Время',
      role: '🎓 Должность',
      experience: '⏳ Стаж',
      mapUrl: '🗺 Карта',
      panoramaUrl: '🌐 Ссылка 360°',
      buttonText: '🔘 Текст кнопки',
      color: '🎨 Цвет',
    };
    return labels[field];
  }

  private itemPreview(section: ItemSectionKey, item: ContentItem) {
    return [
      `${this.sectionIcon(section)} ${this.itemWord(section)}`,
      '',
      `Название: ${item.title}`,
      item.subtitle ? `Категория: ${item.subtitle}` : '',
      item.role ? `Должность: ${item.role}` : '',
      item.experience ? `Стаж: ${item.experience}` : '',
      item.price ? `Цена: ${item.price}` : '',
      item.duration ? `Время: ${item.duration}` : '',
      item.description ? `Описание: ${item.description}` : '',
      item.panoramaUrl ? `Ссылка: ${item.panoramaUrl}` : '',
      item.imageUrl || item.asset ? 'Фото: есть' : this.itemSupportsPhoto(section) ? 'Фото: нет' : '',
    ].filter(Boolean).join('\n');
  }

  private itemFieldPreview(section: ItemSectionKey, item: ContentItem, field: ItemFieldKey, label: string, value: string) {
    return [
      'Предпросмотр перед сохранением',
      '',
      `Элемент: ${item.title}`,
      `Поле: ${label}`,
      '',
      `Сейчас: ${this.fieldValue(item, field) || 'пусто'}`,
      `Станет: ${value || 'пусто'}`,
      '',
      'Так сохранить?',
    ].join('\n');
  }

  private textFieldPreview(label: string, current: string, value: string) {
    return ['Предпросмотр перед сохранением', '', `Поле: ${label}`, '', `Сейчас: ${current || 'пусто'}`, `Станет: ${value || 'пусто'}`, '', 'Так сохранить?'].join('\n');
  }

  private draftPreview(section: ItemSectionKey, draft: Partial<ContentItem>) {
    const fake: ContentItem = {
      id: 'preview',
      title: draft.title || this.defaultTitle(section),
      subtitle: draft.subtitle,
      description: draft.description,
      imageUrl: draft.imageUrl,
      asset: draft.asset,
      icon: draft.icon,
      price: draft.price,
      duration: draft.duration,
      role: draft.role,
      experience: draft.experience,
      mapUrl: draft.mapUrl,
      panoramaUrl: draft.panoramaUrl,
      buttonText: draft.buttonText,
      color: draft.color,
      enabled: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.itemPreview(section, fake);
  }

  private fieldValue(item: ContentItem, field: ItemFieldKey) {
    return item[field]?.toString() ?? '';
  }

  private getTextValue(home: HomeContentPayload, field: TextFieldKey) {
    if (field === 'topHero.greetingTemplate') return home.topHero.greetingTemplate;
    if (field === 'topHero.title') return home.topHero.title;
    if (field === 'topHero.subtitle') return home.topHero.subtitle;
    if (field === 'topHero.backgroundColor') return home.topHero.backgroundColor;
    if (field === 'topHero.backgroundImageUrl') return home.topHero.backgroundImageUrl;
    if (field === 'expertBlock.title') return home.expertBlock.title;
    if (field === 'expertBlock.subtitle') return home.expertBlock.subtitle;
    if (field === 'expertBlock.description') return home.expertBlock.description;
    if (field === 'expertBlock.address') return home.expertBlock.address;
    if (field === 'expertBlock.mapUrl') return home.expertBlock.mapUrl;
    if (field === 'expertBlock.buttonText') return home.expertBlock.buttonText;
    if (field === 'expertBlock.backgroundColor') return home.expertBlock.backgroundColor;
    if (field === 'expertBlock.backgroundImageUrl') return home.expertBlock.backgroundImageUrl;
    if (field === 'about.title') return home.about.title;
    if (field === 'about.description') return home.about.description;
    if (field === 'certificates.title') return home.certificates.title;
    if (field === 'certificates.description') return home.certificates.description;
    if (field === 'interior.title') return home.interior.title;
    if (field === 'interior.description') return home.interior.description;
    if (field === 'works.title') return home.works.title;
    if (field === 'works.description') return home.works.description;
    if (field === 'services.title') return home.services.title;
    if (field === 'services.description') return home.services.description;
    if (field === 'specialists.title') return home.specialists.title;
    if (field === 'specialists.description') return home.specialists.description;
    if (field === 'profile.title') return home.profile.title;
    return home.profile.description;
  }

  private itemListLine(section: ItemSectionKey, item: ContentItem) {
    if (section === 'services.items') return `${item.title}${item.price ? ` · ${item.price}` : ''}${item.duration ? ` · ${item.duration}` : ''}`;
    if (section === 'specialists.items') return `${item.title}${item.experience ? ` · ${item.experience}` : ''}`;
    return item.title;
  }

  private mainKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [{ text: '🏥 О центре', callback_data: 'sec:abt' }, { text: '💅 Услуги', callback_data: 'sec:svc' }],
        [{ text: '📜 Сертификаты', callback_data: 'sec:cert' }, { text: '👩‍⚕️ Специалист', callback_data: 'sec:spc' }],
        [{ text: '🛋 Интерьер', callback_data: 'sec:int' }, { text: '🦶 Наши работы', callback_data: 'sec:wrk' }],
        [{ text: '📍 Адрес и карта', callback_data: 'address' }],
        [{ text: '👀 Что сейчас в приложении', callback_data: 'preview' }, { text: '❔ Помощь', callback_data: 'help' }],
      ],
    };
  }

  private sectionKeyboard(alias: SectionAlias): InlineKeyboardMarkup {
    return { inline_keyboard: [[{ text: '↩️ В раздел', callback_data: `sec:${alias}` }], [{ text: '🏠 Главное меню', callback_data: 'menu' }]] };
  }

  private cancelKeyboard(): InlineKeyboardMarkup {
    return { inline_keyboard: [[{ text: '⬅️ Отмена / назад', callback_data: 'discard' }]] };
  }

  private confirmKeyboard(): InlineKeyboardMarkup {
    return { inline_keyboard: [[{ text: '✅ Сохранить', callback_data: 'confirm' }], [{ text: '❌ Отмена', callback_data: 'discard' }]] };
  }

  private skipPhotoKeyboard(): InlineKeyboardMarkup {
    return { inline_keyboard: [[{ text: '⏭ Пропустить фото', callback_data: 'skip_photo' }], [{ text: '❌ Отмена', callback_data: 'discard' }]] };
  }

  private itemsWord(section: ItemSectionKey) {
    if (section === 'services.items') return 'услуги';
    if (section === 'certificates.items') return 'сертификаты';
    if (section === 'specialists.items') return 'специалистов';
    if (section === 'interior.items') return 'фото интерьера';
    if (section === 'works.items') return 'работы';
    return 'карточки';
  }

  private itemWord(section: ItemSectionKey) {
    if (section === 'services.items') return 'услугу';
    if (section === 'certificates.items') return 'сертификат';
    if (section === 'specialists.items') return 'специалиста';
    if (section === 'interior.items') return 'фото интерьера';
    if (section === 'works.items') return 'работу';
    return 'карточку';
  }

  private sectionIcon(section: ItemSectionKey) {
    if (section === 'services.items') return '💅';
    if (section === 'certificates.items') return '📜';
    if (section === 'specialists.items') return '👩‍⚕️';
    if (section === 'interior.items') return '🛋';
    if (section === 'works.items') return '🦶';
    if (section === 'profile.items') return '👤';
    return '🏥';
  }

  private defaultTitle(section: ItemSectionKey) {
    if (section === 'services.items') return 'Новая услуга';
    if (section === 'specialists.items') return 'Новый специалист';
    if (section === 'certificates.items') return 'Сертификат';
    if (section === 'works.items') return 'Наша работа';
    if (section === 'profile.items') return 'Раздел профиля';
    return 'Новая карточка';
  }

  private sectionFromAlias(alias: string): ItemSectionKey {
    return sectionMap[(alias as SectionAlias) || 'abt'] ?? 'about.items';
  }

  private textFieldFromAlias(alias: string): TextFieldKey {
    return textFieldMap[(alias as TextAlias) || 'hgreet'] ?? 'topHero.greetingTemplate';
  }

  private short(value: string, max = 30) {
    return value.length > max ? `${value.slice(0, Math.max(1, max - 3))}...` : value;
  }

  private isAdmin(userId: number) {
    return this.adminIds().has(String(userId));
  }

  private adminIds() {
    return new Set((this.config.get<string>('TELEGRAM_ADMIN_IDS') ?? '').split(',').map((item) => item.trim()).filter((item) => this.isRealValue(item)));
  }

  private botToken() {
    return (this.config.get<string>('TELEGRAM_ADMIN_BOT_TOKEN') || '').trim();
  }

  private isRealValue(value?: string) {
    const text = value?.trim() ?? '';
    if (!text) return false;
    if (text.startsWith('put_')) return false;
    if (text.includes('your-') || text.includes('your_')) return false;
    if (text.includes('_here')) return false;
    return true;
  }

  private async sendText(chatId: number, text: string, replyMarkup?: InlineKeyboardMarkup) {
    await this.postTelegram('sendMessage', { chat_id: chatId, text, reply_markup: replyMarkup, disable_web_page_preview: true });
  }

  private async answerCallback(callbackId: string) {
    await this.postTelegram('answerCallbackQuery', { callback_query_id: callbackId }).catch(() => undefined);
  }

  private async postTelegram<T = Record<string, unknown>>(method: string, payload: Record<string, unknown>): Promise<T> {
    const response = await axios.post<T>(`https://api.telegram.org/bot${this.botToken()}/${method}`, payload, { timeout: 25_000, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    return response.data;
  }

  private async saveIncomingPhoto(message: TelegramMessage) {
    if (!message.photo || message.photo.length === 0) return null;
    const bestPhoto = [...message.photo].sort((a, b) => (b.file_size ?? b.width * b.height) - (a.file_size ?? a.width * a.height))[0];
    const fileResponse = await this.postTelegram<{ result?: { file_path?: string } }>('getFile', { file_id: bestPhoto.file_id });
    const filePath = fileResponse.result?.file_path;
    if (!filePath) throw new Error('Telegram did not return file_path');
    const url = `https://api.telegram.org/file/bot${this.botToken()}/${filePath}`;
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer', timeout: 20_000 });
    const mimeType = response.headers['content-type']?.toString() || 'image/jpeg';
    const originalName = filePath.split('/').pop() || `telegram-${Date.now()}.jpg`;
    const saved = await this.media.saveContentFile({ originalName, buffer: Buffer.from(response.data), mimeType });
    return saved.url;
  }
}

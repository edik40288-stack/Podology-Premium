import type { ContentItem, ItemFieldKey, ItemSectionKey, TextFieldKey } from '../content/types';

export type TelegramPhotoSize = { file_id: string; width: number; height: number; file_size?: number };
export type TelegramMessage = {
  message_id: number;
  from?: { id: number; first_name?: string; last_name?: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
};
export type TelegramCallbackQuery = { id: string; from: { id: number; first_name?: string; username?: string }; message?: TelegramMessage; data?: string };
export type TelegramUpdate = { update_id: number; message?: TelegramMessage; callback_query?: TelegramCallbackQuery };
export type InlineButton = { text: string; callback_data: string };
export type InlineKeyboardMarkup = { inline_keyboard: InlineButton[][] };

export type SectionAlias = 'abt' | 'cert' | 'int' | 'pan' | 'wrk' | 'svc' | 'spc' | 'prof';
export type TextAlias =
  | 'hgreet'
  | 'htitle'
  | 'hsub'
  | 'hcolor'
  | 'hbg'
  | 'xtitle'
  | 'xsub'
  | 'xdesc'
  | 'xaddr'
  | 'xmap'
  | 'xbtn'
  | 'xcolor'
  | 'xbg'
  | 'atitle'
  | 'adesc'
  | 'ctitle'
  | 'cdesc'
  | 'ititle'
  | 'idesc'
  | 'wtitle'
  | 'wdesc'
  | 'stitle'
  | 'sdesc'
  | 'ptitle'
  | 'pdesc'
  | 'rtitle'
  | 'rdesc';

export type AdminSession =
  | { kind: 'textFieldInput'; field: TextFieldKey; label: string }
  | { kind: 'confirmTextField'; field: TextFieldKey; label: string; value: string }
  | { kind: 'itemFieldInput'; section: ItemSectionKey; index: number; itemId: string; field: ItemFieldKey; label: string }
  | { kind: 'confirmItemField'; section: ItemSectionKey; index: number; itemId: string; field: ItemFieldKey; label: string; value: string }
  | { kind: 'addWizard'; section: ItemSectionKey; label: string; step: number; draft: Partial<ContentItem> }
  | { kind: 'confirmAddItem'; section: ItemSectionKey; label: string; draft: Partial<ContentItem> }
  | { kind: 'replacePhotoInput'; section: ItemSectionKey; index: number; itemId: string; label: string }
  | { kind: 'confirmReplacePhoto'; section: ItemSectionKey; index: number; itemId: string; label: string; imageUrl: string }
  | { kind: 'backgroundPhotoInput'; field: TextFieldKey; label: string }
  | { kind: 'confirmBackgroundPhoto'; field: TextFieldKey; label: string; imageUrl: string };

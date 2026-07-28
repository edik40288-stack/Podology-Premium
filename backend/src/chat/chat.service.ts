import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { repairOptionalMojibake } from "../common/text";
import { DatabaseService } from "../database/database.service";
import { TelegramService } from "../telegram/telegram.service";

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderPhone?: string;
  senderRole?: "client" | "doctor" | "admin" | "system";
  text?: string;
  mediaUrl?: string;
  mediaType?: "photo" | "video";
  createdAt: string;
  deliveredToTelegram?: boolean;
  telegramMessageId?: number | null;
  telegramTopicId?: number | null;
  telegramDeliveryError?: string;
  telegramRetryCount?: number;
};

export type ChatRoom = {
  roomId: string;
  clientName?: string;
  clientPhone?: string;
  telegramTopicId?: number | null;
  telegramTopicName?: string;
  createdAt: string;
  updatedAt: string;
};

type ChatStore = {
  version: number;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  telegramMessages: {
    telegramMessageId: number;
    roomId: string;
    telegramTopicId?: number | null;
  }[];
};

type RoomRow = {
  room_id: string;
  client_name?: string | null;
  client_phone?: string | null;
  telegram_topic_id?: number | null;
  telegram_topic_name?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type MessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string | null;
  sender_phone?: string | null;
  sender_role?: string | null;
  text?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  delivered_to_telegram?: boolean | null;
  telegram_message_id?: number | null;
  telegram_topic_id?: number | null;
  created_at: Date | string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly storePath = join(process.cwd(), "data", "chat-store.json");
  private store?: ChatStore;

  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegram: TelegramService,
    private readonly db: DatabaseService,
  ) {}

  async list(roomId: string) {
    if (this.db.isPostgres) {
      const result = await this.db.query<MessageRow>(
        "select * from chat_messages where room_id = $1 order by created_at asc",
        [roomId],
      );
      return result.rows.map((row) => this.messageFromRow(row));
    }
    return this.readStore().messages.filter(
      (message) => message.roomId === roomId,
    );
  }

  async rooms() {
    if (this.db.isPostgres) {
      const result = await this.db.query<RoomRow>(
        "select * from chat_rooms order by updated_at desc limit 200",
      );
      return result.rows.map((row) => this.roomFromRow(row));
    }
    return this.readStore().rooms.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  async findRoomIdByTelegramMessageId(messageId: number) {
    if (this.db.isPostgres) {
      const result = await this.db.query<{ room_id: string }>(
        "select room_id from telegram_messages where telegram_message_id = $1 limit 1",
        [messageId],
      );
      return result.rows[0]?.room_id;
    }
    const record = this.readStore().telegramMessages.find(
      (item) => item.telegramMessageId === messageId,
    );
    return record?.roomId;
  }

  async findRoomIdByTelegramTopicId(topicId?: number | null) {
    if (!topicId) return undefined;
    if (this.db.isPostgres) {
      const result = await this.db.query<{ room_id: string }>(
        "select room_id from chat_rooms where telegram_topic_id = $1 limit 1",
        [topicId],
      );
      return result.rows[0]?.room_id;
    }
    return this.readStore().rooms.find(
      (room) => room.telegramTopicId === topicId,
    )?.roomId;
  }

  async findTelegramTopicIdByRoomId(roomId: string) {
    if (this.db.isPostgres) {
      const result = await this.db.query<{ telegram_topic_id?: number | null }>(
        "select telegram_topic_id from chat_rooms where room_id = $1 limit 1",
        [roomId],
      );
      return result.rows[0]?.telegram_topic_id ?? undefined;
    }
    return (
      this.readStore().rooms.find((room) => room.roomId === roomId)
        ?.telegramTopicId ?? undefined
    );
  }

  async bindTelegramTopic(roomId: string, topicId: number, topicName?: string) {
    if (this.db.isPostgres) {
      const room = await this.ensureRoomPostgres({
        roomId,
        telegramTopicId: topicId,
        telegramTopicName: topicName,
      });
      await this.db.query(
        "update chat_rooms set telegram_topic_id = $2, telegram_topic_name = coalesce($3, telegram_topic_name), updated_at = now() where room_id = $1",
        [
          roomId,
          topicId,
          topicName || room.telegramTopicName || this.topicNameForRoom(room),
        ],
      );
      return {
        ...room,
        telegramTopicId: topicId,
        telegramTopicName:
          topicName || room.telegramTopicName || this.topicNameForRoom(room),
        updatedAt: new Date().toISOString(),
      };
    }
    const store = this.readStore();
    const room = this.ensureRoom(store, {
      roomId,
      telegramTopicId: topicId,
      telegramTopicName: topicName,
    });
    room.telegramTopicId = topicId;
    room.telegramTopicName =
      topicName || room.telegramTopicName || this.topicNameForRoom(room);
    room.updatedAt = new Date().toISOString();
    this.writeStore(store);
    return room;
  }

  async registerTelegramMessage(input: {
    telegramMessageId?: number | null;
    roomId: string;
    telegramTopicId?: number | null;
  }) {
    if (!input.telegramMessageId) return;
    if (this.db.isPostgres) {
      await this.db.query(
        `insert into telegram_messages (telegram_message_id, room_id, telegram_topic_id)
         values ($1, $2, $3)
         on conflict (telegram_message_id) do nothing`,
        [input.telegramMessageId, input.roomId, input.telegramTopicId ?? null],
      );
      return;
    }
    const store = this.readStore();
    if (
      !store.telegramMessages.some(
        (item) => item.telegramMessageId === input.telegramMessageId,
      )
    ) {
      store.telegramMessages.push({
        telegramMessageId: input.telegramMessageId,
        roomId: input.roomId,
        telegramTopicId: input.telegramTopicId ?? null,
      });
      this.writeStore(store);
    }
  }

  async createTelegramAdminReply(input: {
    roomId: string;
    adminId: string;
    adminName?: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: "photo" | "video";
  }) {
    return this.create({
      roomId: input.roomId,
      senderId: input.adminId,
      senderName: input.adminName || "Администратор",
      senderRole: "admin",
      text: input.text,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
    });
  }

  async deleteRoom(roomId: string) {
    if (this.db.isPostgres) {
      const messages = await this.db.query<{ media_url?: string | null }>(
        "select media_url from chat_messages where room_id = $1 and media_url is not null",
        [roomId],
      );
      const deleted = await this.db.query(
        "delete from chat_rooms where room_id = $1",
        [roomId],
      );
      return {
        roomId,
        deleted: (deleted.rowCount ?? 0) > 0,
        mediaUrls: messages.rows
          .map((row) => row.media_url)
          .filter((url): url is string => Boolean(url)),
      };
    }
    const store = this.readStore();
    const roomMessages = store.messages.filter(
      (message) => message.roomId === roomId,
    );
    const mediaUrls = roomMessages
      .map((message) => message.mediaUrl)
      .filter((url): url is string => Boolean(url));
    store.rooms = store.rooms.filter((room) => room.roomId !== roomId);
    store.messages = store.messages.filter(
      (message) => message.roomId !== roomId,
    );
    store.telegramMessages = store.telegramMessages.filter(
      (message) => message.roomId !== roomId,
    );
    this.writeStore(store);
    return { roomId, deleted: roomMessages.length > 0, mediaUrls };
  }

  async create(
    input: Omit<
      ChatMessage,
      | "id"
      | "createdAt"
      | "deliveredToTelegram"
      | "telegramMessageId"
      | "telegramTopicId"
    >,
  ) {
    const normalizedInput = {
      ...input,
      senderName: repairOptionalMojibake(input.senderName),
      senderPhone: repairOptionalMojibake(input.senderPhone),
      text: repairOptionalMojibake(input.text),
    };

    const message: ChatMessage = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...normalizedInput,
    };

    if (this.db.isPostgres) await this.createPostgres(normalizedInput, message);
    else this.createJson(normalizedInput, message);

    if ((message.senderRole ?? "client") === "client") {
      await this.deliverMessageToTelegram(message);
      if (!message.deliveredToTelegram)
        this.scheduleTelegramRetry(message.id, 1);
    }

    return message;
  }

  async retryUndeliveredTelegramMessages(limit = 20) {
    const candidates = await this.undeliveredTelegramMessages(limit);
    let delivered = 0;
    for (const message of candidates) {
      await this.deliverMessageToTelegram(message);
      if (message.deliveredToTelegram) delivered += 1;
    }
    return { ok: true, scanned: candidates.length, delivered };
  }

  private async deliverMessageToTelegram(message: ChatMessage) {
    const result = await this.telegram.notifyNewClientMessage(message);
    message.deliveredToTelegram = Boolean(
      result && "ok" in result && result.ok === true,
    );
    message.telegramDeliveryError = undefined;
    if (
      result &&
      "telegramMessageId" in result &&
      typeof result.telegramMessageId === "number"
    )
      message.telegramMessageId = result.telegramMessageId;
    if (
      result &&
      "telegramTopicId" in result &&
      typeof result.telegramTopicId === "number"
    ) {
      message.telegramTopicId = result.telegramTopicId;
      await this.bindTelegramTopic(
        message.roomId,
        result.telegramTopicId,
        result.telegramTopicName,
      );
    }
    if (!message.deliveredToTelegram) {
      const reason =
        result && "reason" in result
          ? String(result.reason)
          : "telegram_not_delivered";
      message.telegramDeliveryError = reason;
    }
    await this.registerTelegramMessage({
      telegramMessageId: message.telegramMessageId,
      roomId: message.roomId,
      telegramTopicId: message.telegramTopicId,
    });
    await this.updateMessageTelegramFields(message);
    return message;
  }

  private scheduleTelegramRetry(messageId: string, attempt: number) {
    const delays = [60_000, 5 * 60_000, 15 * 60_000];
    if (attempt < 1 || attempt > delays.length) return;
    const timer = setTimeout(
      async () => {
        try {
          const message = await this.findMessageById(messageId);
          if (!message || message.deliveredToTelegram) return;
          message.telegramRetryCount = attempt;
          await this.deliverMessageToTelegram(message);
          if (!message.deliveredToTelegram)
            this.scheduleTelegramRetry(messageId, attempt + 1);
        } catch (error) {
          this.logger.warn(
            `Telegram retry failed for message ${messageId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
      delays[attempt - 1],
    );
    timer.unref?.();
  }

  private async findMessageById(messageId: string) {
    if (this.db.isPostgres) {
      const result = await this.db.query<MessageRow>(
        "select * from chat_messages where id = $1 limit 1",
        [messageId],
      );
      return result.rows[0] ? this.messageFromRow(result.rows[0]) : undefined;
    }
    return this.readStore().messages.find(
      (message) => message.id === messageId,
    );
  }

  private async undeliveredTelegramMessages(limit: number) {
    if (this.db.isPostgres) {
      const result = await this.db.query<MessageRow>(
        `select * from chat_messages
         where coalesce(delivered_to_telegram, false) = false
           and coalesce(sender_role, 'client') = 'client'
         order by created_at asc
         limit $1`,
        [limit],
      );
      return result.rows.map((row) => this.messageFromRow(row));
    }
    return this.readStore()
      .messages.filter(
        (message) =>
          (message.senderRole ?? "client") === "client" &&
          message.deliveredToTelegram !== true,
      )
      .slice(0, limit);
  }

  private async createPostgres(
    normalizedInput: Omit<
      ChatMessage,
      | "id"
      | "createdAt"
      | "deliveredToTelegram"
      | "telegramMessageId"
      | "telegramTopicId"
    >,
    message: ChatMessage,
  ) {
    await this.ensureRoomPostgres({
      roomId: normalizedInput.roomId,
      clientName:
        normalizedInput.senderRole === "client"
          ? normalizedInput.senderName
          : undefined,
      clientPhone:
        normalizedInput.senderRole === "client"
          ? normalizedInput.senderPhone
          : undefined,
    });
    await this.db.query(
      `insert into chat_messages (id, room_id, sender_id, sender_name, sender_phone, sender_role, text, media_url, media_type, created_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        message.id,
        message.roomId,
        message.senderId,
        message.senderName ?? null,
        message.senderPhone ?? null,
        message.senderRole ?? "client",
        message.text ?? null,
        message.mediaUrl ?? null,
        message.mediaType ?? null,
        message.createdAt,
      ],
    );
    await this.db.query(
      "update chat_rooms set updated_at = now() where room_id = $1",
      [message.roomId],
    );
  }

  private createJson(
    normalizedInput: Omit<
      ChatMessage,
      | "id"
      | "createdAt"
      | "deliveredToTelegram"
      | "telegramMessageId"
      | "telegramTopicId"
    >,
    message: ChatMessage,
  ) {
    const store = this.readStore();
    this.ensureRoom(store, {
      roomId: normalizedInput.roomId,
      clientName:
        normalizedInput.senderRole === "client"
          ? normalizedInput.senderName
          : undefined,
      clientPhone:
        normalizedInput.senderRole === "client"
          ? normalizedInput.senderPhone
          : undefined,
    });
    store.messages.push(message);
    this.touchRoom(store, normalizedInput.roomId);
    this.writeStore(store);
  }

  private async updateMessageTelegramFields(message: ChatMessage) {
    if (this.db.isPostgres) {
      await this.db.query(
        `update chat_messages set delivered_to_telegram = $2, telegram_message_id = $3, telegram_topic_id = $4 where id = $1`,
        [
          message.id,
          message.deliveredToTelegram ?? false,
          message.telegramMessageId ?? null,
          message.telegramTopicId ?? null,
        ],
      );
      return;
    }
    const nextStore = this.readStore();
    const existing = nextStore.messages.find((item) => item.id === message.id);
    if (existing) Object.assign(existing, message);
    this.writeStore(nextStore);
  }

  private async ensureRoomPostgres(input: {
    roomId: string;
    clientName?: string;
    clientPhone?: string;
    telegramTopicId?: number | null;
    telegramTopicName?: string;
  }) {
    const result = await this.db.query<RoomRow>(
      `insert into chat_rooms (room_id, client_name, client_phone, telegram_topic_id, telegram_topic_name, created_at, updated_at)
       values ($1, $2, $3, $4, $5, now(), now())
       on conflict (room_id) do update set
         client_name = coalesce($2, chat_rooms.client_name),
         client_phone = coalesce($3, chat_rooms.client_phone),
         telegram_topic_id = coalesce($4, chat_rooms.telegram_topic_id),
         telegram_topic_name = coalesce($5, chat_rooms.telegram_topic_name),
         updated_at = now()
       returning *`,
      [
        input.roomId,
        input.clientName ?? null,
        input.clientPhone ?? null,
        input.telegramTopicId ?? null,
        input.telegramTopicName ?? null,
      ],
    );
    return this.roomFromRow(result.rows[0]);
  }

  private ensureRoom(
    store: ChatStore,
    input: {
      roomId: string;
      clientName?: string;
      clientPhone?: string;
      telegramTopicId?: number | null;
      telegramTopicName?: string;
    },
  ) {
    const now = new Date().toISOString();
    let room = store.rooms.find((item) => item.roomId === input.roomId);
    if (!room) {
      room = {
        roomId: input.roomId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        telegramTopicId: input.telegramTopicId ?? null,
        telegramTopicName: input.telegramTopicName,
        createdAt: now,
        updatedAt: now,
      };
      store.rooms.push(room);
    }
    if (input.clientName) room.clientName = input.clientName;
    if (input.clientPhone) room.clientPhone = input.clientPhone;
    if (input.telegramTopicId) room.telegramTopicId = input.telegramTopicId;
    if (input.telegramTopicName)
      room.telegramTopicName = input.telegramTopicName;
    room.updatedAt = now;
    return room;
  }

  private touchRoom(store: ChatStore, roomId: string) {
    const room = this.ensureRoom(store, { roomId });
    room.updatedAt = new Date().toISOString();
  }

  private topicNameForRoom(room: ChatRoom) {
    const name = room.clientName?.trim() || "Клиент";
    const phone = room.clientPhone?.trim();
    return phone
      ? `${name} · ${phone}`
      : `${name} · ${room.roomId.slice(0, 12)}`;
  }

  private readStore() {
    if (this.store) return this.store;
    try {
      if (existsSync(this.storePath)) {
        const parsed = JSON.parse(
          readFileSync(this.storePath, "utf8"),
        ) as Partial<ChatStore>;
        this.store = {
          version: 1,
          rooms: Array.isArray(parsed.rooms)
            ? parsed.rooms.map((room) => ({
                ...room,
                clientName: repairOptionalMojibake(room.clientName),
                clientPhone: repairOptionalMojibake(room.clientPhone),
                telegramTopicName: repairOptionalMojibake(
                  room.telegramTopicName,
                ),
              }))
            : [],
          messages: Array.isArray(parsed.messages)
            ? parsed.messages.map((message) => ({
                ...message,
                senderName: repairOptionalMojibake(message.senderName),
                senderPhone: repairOptionalMojibake(message.senderPhone),
                text: repairOptionalMojibake(message.text),
              }))
            : [],
          telegramMessages: Array.isArray(parsed.telegramMessages)
            ? parsed.telegramMessages
            : [],
        };
        return this.store;
      }
    } catch {
      // fall through to fresh store
    }
    this.store = { version: 1, rooms: [], messages: [], telegramMessages: [] };
    return this.store;
  }

  private writeStore(store: ChatStore) {
    mkdirSync(dirname(this.storePath), { recursive: true });
    writeFileSync(this.storePath, JSON.stringify(store, null, 2), "utf8");
    this.store = store;
  }

  private roomFromRow(row: RoomRow): ChatRoom {
    return {
      roomId: row.room_id,
      clientName: repairOptionalMojibake(row.client_name ?? undefined),
      clientPhone: repairOptionalMojibake(row.client_phone ?? undefined),
      telegramTopicId: row.telegram_topic_id ?? null,
      telegramTopicName: repairOptionalMojibake(
        row.telegram_topic_name ?? undefined,
      ),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private messageFromRow(row: MessageRow): ChatMessage {
    return {
      id: row.id,
      roomId: row.room_id,
      senderId: row.sender_id,
      senderName: repairOptionalMojibake(row.sender_name ?? undefined),
      senderPhone: repairOptionalMojibake(row.sender_phone ?? undefined),
      senderRole: (row.sender_role as ChatMessage["senderRole"]) ?? "client",
      text: repairOptionalMojibake(row.text ?? undefined),
      mediaUrl: row.media_url ?? undefined,
      mediaType: (row.media_type as ChatMessage["mediaType"]) ?? undefined,
      deliveredToTelegram: row.delivered_to_telegram ?? undefined,
      telegramMessageId: row.telegram_message_id ?? null,
      telegramTopicId: row.telegram_topic_id ?? null,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }
}

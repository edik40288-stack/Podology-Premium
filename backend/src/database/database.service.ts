import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;

  constructor(private readonly config: ConfigService) {}

  get isPostgres() {
    return (this.config.get<string>('STORAGE_DRIVER') ?? 'json').toLowerCase() === 'postgres';
  }

  async onModuleInit() {
    if (!this.isPostgres) return;
    const connectionString = this.config.get<string>('DATABASE_URL')?.trim();
    if (!connectionString) throw new Error('STORAGE_DRIVER=postgres requires DATABASE_URL');
    this.pool = new Pool({
      connectionString,
      ssl: this.config.get<string>('DATABASE_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : undefined,
      max: Number(this.config.get<string>('DATABASE_POOL_MAX') ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    await this.query('select 1');
    if (this.config.get<string>('RUN_DB_MIGRATIONS_ON_START', 'true') !== 'false') {
      await this.migrate();
    }
    this.logger.log('PostgreSQL storage is online');
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('PostgreSQL pool is not initialized. Check STORAGE_DRIVER and DATABASE_URL.');
    return this.pool.query<T>(text, params);
  }

  async migrate() {
    const sql = `
CREATE TABLE IF NOT EXISTS profiles (
  phone TEXT PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT 'Клиент',
  last_name TEXT NOT NULL DEFAULT '',
  chat_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  booking_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_notifications BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS chat_rooms (
  room_id TEXT PRIMARY KEY,
  client_name TEXT,
  client_phone TEXT,
  telegram_topic_id INTEGER,
  telegram_topic_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  sender_phone TEXT,
  sender_role TEXT NOT NULL DEFAULT 'client',
  text TEXT,
  media_url TEXT,
  media_type TEXT,
  delivered_to_telegram BOOLEAN,
  telegram_message_id INTEGER,
  telegram_topic_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated ON chat_rooms(updated_at DESC);
CREATE TABLE IF NOT EXISTS telegram_messages (
  telegram_message_id INTEGER PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  telegram_topic_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_room ON telegram_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_topic ON chat_rooms(telegram_topic_id);
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL,
  fullname TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  service_title TEXT,
  specialist_name TEXT,
  datetime TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  yclients_record_id TEXT,
  yclients_response JSONB,
  cancel_allowed_until TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_phone_datetime ON bookings(phone, datetime DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS care_cards (
  phone TEXT PRIMARY KEY,
  course_title TEXT NOT NULL DEFAULT 'Карта ухода будет заполнена специалистом',
  course_description TEXT NOT NULL DEFAULT '',
  next_visit_date TEXT NOT NULL DEFAULT '',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings_log (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL,
  fullname TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  datetime TEXT NOT NULL,
  yclients_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;
    await this.query(sql);
  }
}

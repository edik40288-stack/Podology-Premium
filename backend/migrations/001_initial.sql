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
CREATE TABLE IF NOT EXISTS bookings_log (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL,
  fullname TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  datetime TEXT NOT NULL,
  yclients_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

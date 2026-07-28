import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { DatabaseService } from '../database/database.service';

type ProfileRecord = {
  firstName: string;
  lastName: string;
  phone: string;
  chatNotifications: boolean;
  bookingNotifications: boolean;
  marketingNotifications: boolean;
  updatedAt: string;
};

type ProfileStore = {
  version: number;
  profiles: Record<string, ProfileRecord>;
};

type ProfileRow = {
  phone: string;
  first_name: string;
  last_name: string;
  chat_notifications: boolean;
  booking_notifications: boolean;
  marketing_notifications: boolean;
  updated_at: Date | string;
};

@Injectable()
export class ProfileService {
  private readonly path = join(process.cwd(), 'data', 'client-profiles.json');

  constructor(private readonly db: DatabaseService) {}

  async get(phone: string) {
    const normalized = this.normalizePhone(phone);
    if (this.db.isPostgres) {
      const result = await this.db.query<ProfileRow>('select * from profiles where phone = $1 limit 1', [normalized]);
      return result.rows[0] ? this.fromRow(result.rows[0]) : null;
    }
    const store = await this.readStore();
    return store.profiles[normalized] ?? null;
  }

  async deleteByPhone(phone: string) {
    const normalized = this.normalizePhone(phone);
    if (this.db.isPostgres) {
      const result = await this.db.query('delete from profiles where phone = $1', [normalized]);
      return { phone: normalized, deleted: (result.rowCount ?? 0) > 0 };
    }
    const store = await this.readStore();
    const existed = Boolean(store.profiles[normalized]);
    delete store.profiles[normalized];
    await this.writeStore(store);
    return { phone: normalized, deleted: existed };
  }

  async save(input: Partial<ProfileRecord> & { phone: string }) {
    const phone = this.normalizePhone(input.phone);
    if (this.db.isPostgres) return this.savePostgres(input, phone);

    const store = await this.readStore();
    const existing = store.profiles[phone];
    const profile: ProfileRecord = {
      firstName: this.text(input.firstName, existing?.firstName || 'Клиент'),
      lastName: this.text(input.lastName, existing?.lastName || ''),
      phone,
      chatNotifications: input.chatNotifications ?? existing?.chatNotifications ?? true,
      bookingNotifications: input.bookingNotifications ?? existing?.bookingNotifications ?? true,
      marketingNotifications: input.marketingNotifications ?? existing?.marketingNotifications ?? false,
      updatedAt: new Date().toISOString(),
    };
    store.profiles[phone] = profile;
    await this.writeStore(store);
    return profile;
  }

  private async savePostgres(input: Partial<ProfileRecord> & { phone: string }, phone: string) {
    const existing = await this.get(phone);
    const profile: ProfileRecord = {
      firstName: this.text(input.firstName, existing?.firstName || 'Клиент'),
      lastName: this.text(input.lastName, existing?.lastName || ''),
      phone,
      chatNotifications: input.chatNotifications ?? existing?.chatNotifications ?? true,
      bookingNotifications: input.bookingNotifications ?? existing?.bookingNotifications ?? true,
      marketingNotifications: input.marketingNotifications ?? existing?.marketingNotifications ?? false,
      updatedAt: new Date().toISOString(),
    };
    const result = await this.db.query<ProfileRow>(
      `insert into profiles (phone, first_name, last_name, chat_notifications, booking_notifications, marketing_notifications, updated_at)
       values ($1, $2, $3, $4, $5, $6, now())
       on conflict (phone) do update set
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         chat_notifications = excluded.chat_notifications,
         booking_notifications = excluded.booking_notifications,
         marketing_notifications = excluded.marketing_notifications,
         updated_at = now()
       returning *`,
      [profile.phone, profile.firstName, profile.lastName, profile.chatNotifications, profile.bookingNotifications, profile.marketingNotifications],
    );
    return this.fromRow(result.rows[0]);
  }

  private async readStore(): Promise<ProfileStore> {
    try {
      const raw = await readFile(this.path, 'utf8');
      const parsed = JSON.parse(raw) as Partial<ProfileStore>;
      return {
        version: 1,
        profiles: parsed.profiles ?? {},
      };
    } catch {
      return { version: 1, profiles: {} };
    }
  }

  private async writeStore(store: ProfileStore) {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  }

  private fromRow(row: ProfileRow): ProfileRecord {
    return {
      phone: row.phone,
      firstName: row.first_name,
      lastName: row.last_name,
      chatNotifications: row.chat_notifications,
      bookingNotifications: row.booking_notifications,
      marketingNotifications: row.marketing_notifications,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private normalizePhone(value: string) {
    return value.toString().trim();
  }

  private text(value: string | undefined, fallback: string) {
    const text = value?.toString().trim() ?? '';
    return text || fallback;
  }
}

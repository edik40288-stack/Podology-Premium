import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { DatabaseService } from '../database/database.service';

type TimelineEntry = {
  id: string;
  visitDate: string;
  visitNumber: number;
  title: string;
  note: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  imageUrl?: string;
  progressPercent?: number;
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionText?: string;
  actionUrl?: string;
};

type CareCardRecord = {
  phone: string;
  courseTitle: string;
  courseDescription: string;
  nextVisitDate: string;
  progressPercent: number;
  timeline: TimelineEntry[];
  recommendations: Recommendation[];
  updatedAt: string;
};

type CareCardStore = {
  version: number;
  cards: Record<string, CareCardRecord>;
};

type CareCardRow = {
  phone: string;
  course_title: string;
  course_description: string;
  next_visit_date: string;
  progress_percent: number;
  timeline: TimelineEntry[] | string;
  recommendations: Recommendation[] | string;
  updated_at: Date | string;
};

@Injectable()
export class CareCardService {
  private readonly path = join(process.cwd(), 'data', 'client-care-cards.json');

  constructor(private readonly db: DatabaseService) {}

  async get(phone: string) {
    const normalized = this.normalizePhone(phone);
    if (!normalized) return this.emptyCard('');

    if (this.db.isPostgres) {
      const result = await this.db.query<CareCardRow>('select * from care_cards where phone = $1 limit 1', [normalized]);
      return result.rows[0] ? this.fromRow(result.rows[0]) : this.emptyCard(normalized);
    }

    const store = await this.readStore();
    return store.cards[normalized] ?? this.emptyCard(normalized);
  }

  async save(input: Partial<CareCardRecord> & { phone: string }) {
    const phone = this.normalizePhone(input.phone);
    const existing = await this.get(phone);
    const card: CareCardRecord = {
      phone,
      courseTitle: this.text(input.courseTitle, existing.courseTitle),
      courseDescription: this.text(input.courseDescription, existing.courseDescription),
      nextVisitDate: this.text(input.nextVisitDate, existing.nextVisitDate),
      progressPercent: this.percent(input.progressPercent ?? existing.progressPercent),
      timeline: this.timeline(input.timeline ?? existing.timeline),
      recommendations: this.recommendations(input.recommendations ?? existing.recommendations),
      updatedAt: new Date().toISOString(),
    };

    if (this.db.isPostgres) {
      const result = await this.db.query<CareCardRow>(
        `insert into care_cards (phone, course_title, course_description, next_visit_date, progress_percent, timeline, recommendations, updated_at)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, now())
         on conflict (phone) do update set
           course_title = excluded.course_title,
           course_description = excluded.course_description,
           next_visit_date = excluded.next_visit_date,
           progress_percent = excluded.progress_percent,
           timeline = excluded.timeline,
           recommendations = excluded.recommendations,
           updated_at = now()
         returning *`,
        [card.phone, card.courseTitle, card.courseDescription, card.nextVisitDate, card.progressPercent, JSON.stringify(card.timeline), JSON.stringify(card.recommendations)],
      );
      return this.fromRow(result.rows[0]);
    }

    const store = await this.readStore();
    store.cards[phone] = card;
    await this.writeStore(store);
    return card;
  }

  private emptyCard(phone: string): CareCardRecord {
    return {
      phone,
      courseTitle: 'Карта ухода будет заполнена специалистом',
      courseDescription: 'После визита специалист добавит курс, прогресс, рекомендации и динамику.',
      nextVisitDate: '',
      progressPercent: 0,
      timeline: [],
      recommendations: [
        {
          id: 'chat',
          title: 'Рекомендации в чате',
          description: 'Специалист сможет отправить рекомендации и уточнения после приёма.',
          icon: 'chat',
        },
        {
          id: 'visits',
          title: 'График визитов',
          description: 'Следующие визиты появятся после назначения специалистом.',
          icon: 'calendar',
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }

  private async readStore(): Promise<CareCardStore> {
    try {
      const raw = await readFile(this.path, 'utf8');
      const parsed = JSON.parse(raw) as Partial<CareCardStore>;
      return { version: 1, cards: parsed.cards ?? {} };
    } catch {
      return { version: 1, cards: {} };
    }
  }

  private async writeStore(store: CareCardStore) {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  }

  private fromRow(row: CareCardRow): CareCardRecord {
    return {
      phone: row.phone,
      courseTitle: row.course_title,
      courseDescription: row.course_description,
      nextVisitDate: row.next_visit_date,
      progressPercent: this.percent(row.progress_percent),
      timeline: this.timeline(typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline),
      recommendations: this.recommendations(typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private timeline(value: unknown): TimelineEntry[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
      .map((item, index) => ({
        id: this.text(item.id, `visit-${index + 1}`),
        visitDate: this.text(item.visitDate, ''),
        visitNumber: Number(item.visitNumber ?? index + 1),
        title: this.text(item.title, 'Визит'),
        note: this.text(item.note, ''),
        beforeImageUrl: this.text(item.beforeImageUrl, ''),
        afterImageUrl: this.text(item.afterImageUrl, ''),
        imageUrl: this.text(item.imageUrl, ''),
        progressPercent: item.progressPercent === undefined ? undefined : this.percent(Number(item.progressPercent)),
      }))
      .sort((a, b) => this.sortDate(b.visitDate) - this.sortDate(a.visitDate));
  }

  private recommendations(value: unknown): Recommendation[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
      .map((item, index) => ({
        id: this.text(item.id, `recommendation-${index + 1}`),
        title: this.text(item.title, 'Рекомендация'),
        description: this.text(item.description, ''),
        icon: this.text(item.icon, 'spa'),
        actionText: this.text(item.actionText, ''),
        actionUrl: this.text(item.actionUrl, ''),
      }));
  }

  private sortDate(value: string) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : 0;
  }

  private percent(value: unknown) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(100, Math.round(number)));
  }

  private normalizePhone(value: string) {
    return value.toString().trim();
  }

  private text(value: unknown, fallback: string) {
    const text = value?.toString().trim() ?? '';
    return text || fallback;
  }
}

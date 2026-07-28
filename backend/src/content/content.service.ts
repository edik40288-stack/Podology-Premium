import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { repairMojibake } from '../common/text';
import { fallbackHomeContent } from './fallback-home-content';
import type { ContentItem, ContentSection, HomeContentPayload, ItemFieldKey, ItemSectionKey, TextFieldKey } from './types';

@Injectable()
export class ContentService {
  private readonly homePath = join(process.cwd(), 'content', 'home.json');

  async getHome() {
    return { ok: true, data: await this.readHomeData() };
  }

  async saveHome(payload: HomeContentPayload) {
    const data = this.normalize(payload);
    await this.writeHomeData(data);
    return { ok: true, data };
  }

  async setTextField(field: TextFieldKey, value: string) {
    const home = await this.readHomeData();
    this.writeTextField(home, field, value.trim());
    const data = this.normalize(home);
    await this.writeHomeData(data);
    return data;
  }

  async addItem(section: ItemSectionKey, input: Partial<ContentItem>) {
    const home = await this.readHomeData();
    const list = this.getList(home, section);
    const now = new Date().toISOString();
    const item: ContentItem = {
      id: this.newId(section),
      title: this.text(input.title, this.defaultTitle(section)),
      subtitle: this.optional(input.subtitle),
      description: this.optional(input.description),
      imageUrl: this.optional(input.imageUrl),
      asset: this.optional(input.asset),
      icon: this.optional(input.icon),
      price: this.optional(input.price),
      duration: this.optional(input.duration),
      role: this.optional(input.role),
      experience: this.optional(input.experience),
      mapUrl: this.optional(input.mapUrl),
      panoramaUrl: this.optional(input.panoramaUrl),
      buttonText: this.optional(input.buttonText),
      color: this.optional(input.color),
      enabled: input.enabled ?? true,
      sortOrder: typeof input.sortOrder === 'number' ? input.sortOrder : list.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    list.push(item);
    const data = this.normalize(home);
    await this.writeHomeData(data);
    return item;
  }

  async updateItem(section: ItemSectionKey, id: string, patch: Partial<ContentItem>) {
    const home = await this.readHomeData();
    const list = this.getList(home, section);
    const item = list.find((entry) => entry.id === id);
    if (!item) return null;
    const allowed: ItemFieldKey[] = ['title', 'subtitle', 'description', 'imageUrl', 'asset', 'icon', 'price', 'duration', 'role', 'experience', 'mapUrl', 'panoramaUrl', 'buttonText', 'color'];
    for (const key of allowed) {
      if (patch[key] !== undefined) item[key] = patch[key]?.toString().trim();
    }
    if (patch.enabled !== undefined) item.enabled = patch.enabled;
    if (patch.sortOrder !== undefined) item.sortOrder = Number(patch.sortOrder);
    item.updatedAt = new Date().toISOString();
    const data = this.normalize(home);
    await this.writeHomeData(data);
    return item;
  }

  async deleteItem(section: ItemSectionKey, id: string) {
    const home = await this.readHomeData();
    const list = this.getList(home, section);
    const before = list.length;
    const next = list.filter((entry) => entry.id !== id);
    this.setList(home, section, next);
    const data = this.normalize(home);
    await this.writeHomeData(data);
    return before !== next.length;
  }

  async clearSection(section: ItemSectionKey) {
    const home = await this.readHomeData();
    this.setList(home, section, []);
    const data = this.normalize(home);
    await this.writeHomeData(data);
    return data;
  }

  async listItems(section: ItemSectionKey) {
    const home = await this.readHomeData();
    return this.getList(home, section).filter((item) => item.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async summary() {
    const home = await this.readHomeData();
    return {
      brandName: home.brandName,
      greeting: home.topHero.greetingTemplate,
      topTitle: home.topHero.title,
      expertTitle: home.expertBlock.title,
      address: home.expertBlock.address,
      aboutBlocks: home.about.items.length,
      certificates: home.certificates.items.length,
      interiorPhotos: home.interior.items.length,
      panoramas360: home.interior.panoramas.length,
      works: home.works.items.length,
      services: home.services.items.length,
      specialists: home.specialists.items.length,
      profileSections: home.profile.items.length,
    };
  }

  async readHomeData(): Promise<HomeContentPayload> {
    try {
      const raw = await readFile(this.homePath, 'utf8');
      return this.normalize(JSON.parse(raw) as Partial<HomeContentPayload>);
    } catch {
      return this.normalize(fallbackHomeContent);
    }
  }

  private async writeHomeData(data: HomeContentPayload) {
    await mkdir(dirname(this.homePath), { recursive: true });
    await writeFile(this.homePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  private normalize(payload: Partial<HomeContentPayload>): HomeContentPayload {
    return {
      brandName: this.text(payload.brandName, fallbackHomeContent.brandName),
      topHero: {
        greetingTemplate: this.text(payload.topHero?.greetingTemplate, fallbackHomeContent.topHero.greetingTemplate),
        title: this.text(payload.topHero?.title, fallbackHomeContent.topHero.title),
        subtitle: this.text(payload.topHero?.subtitle, fallbackHomeContent.topHero.subtitle),
        backgroundColor: this.text(payload.topHero?.backgroundColor, fallbackHomeContent.topHero.backgroundColor),
        backgroundImageUrl: this.text(payload.topHero?.backgroundImageUrl, ''),
      },
      expertBlock: {
        title: this.text(payload.expertBlock?.title, fallbackHomeContent.expertBlock.title),
        subtitle: this.text(payload.expertBlock?.subtitle, fallbackHomeContent.expertBlock.subtitle),
        description: this.text(payload.expertBlock?.description, fallbackHomeContent.expertBlock.description),
        address: this.text(payload.expertBlock?.address, fallbackHomeContent.expertBlock.address),
        mapUrl: this.text(payload.expertBlock?.mapUrl, fallbackHomeContent.expertBlock.mapUrl),
        buttonText: this.text(payload.expertBlock?.buttonText, fallbackHomeContent.expertBlock.buttonText),
        backgroundColor: this.text(payload.expertBlock?.backgroundColor, fallbackHomeContent.expertBlock.backgroundColor),
        backgroundImageUrl: this.text(payload.expertBlock?.backgroundImageUrl, ''),
      },
      about: this.normalizeSection(payload.about, fallbackHomeContent.about),
      certificates: this.normalizeSection(payload.certificates, fallbackHomeContent.certificates),
      interior: {
        ...this.normalizeSection(payload.interior, fallbackHomeContent.interior),
        panoramas: this.normalizeItems(payload.interior?.panoramas, fallbackHomeContent.interior.panoramas),
      },
      works: this.normalizeSection(payload.works, fallbackHomeContent.works),
      services: this.normalizeSection(payload.services, fallbackHomeContent.services),
      specialists: this.normalizeSection(payload.specialists, fallbackHomeContent.specialists),
      profile: this.normalizeSection(payload.profile, fallbackHomeContent.profile),
    };
  }

  private normalizeSection(value: Partial<ContentSection> | undefined, fallback: ContentSection): ContentSection {
    return {
      title: this.text(value?.title, fallback.title),
      description: this.text(value?.description, fallback.description),
      items: this.normalizeItems(value?.items, fallback.items),
    };
  }

  private normalizeItems(value: Partial<ContentItem>[] | undefined, fallback: ContentItem[]) {
    const source = Array.isArray(value) ? value : fallback;
    return source
      .filter((item) => item.enabled !== false)
      .map((item, index) => this.normalizeItem(item, index))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private normalizeItem(item: Partial<ContentItem>, index: number): ContentItem {
    const now = new Date().toISOString();
    return {
      id: this.text(item.id, `item-${index + 1}`),
      title: this.text(item.title, 'Элемент'),
      subtitle: this.optional(item.subtitle),
      description: this.optional(item.description),
      imageUrl: this.optional(item.imageUrl),
      asset: this.optional(item.asset),
      icon: this.optional(item.icon),
      price: this.optional(item.price),
      duration: this.optional(item.duration),
      role: this.optional(item.role),
      experience: this.optional(item.experience),
      mapUrl: this.optional(item.mapUrl),
      panoramaUrl: this.optional(item.panoramaUrl),
      buttonText: this.optional(item.buttonText),
      color: this.optional(item.color),
      enabled: item.enabled ?? true,
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index + 1,
      createdAt: this.text(item.createdAt, now),
      updatedAt: this.text(item.updatedAt, now),
    };
  }

  private getList(home: HomeContentPayload, section: ItemSectionKey) {
    if (section === 'about.items') return home.about.items;
    if (section === 'certificates.items') return home.certificates.items;
    if (section === 'interior.items') return home.interior.items;
    if (section === 'interior.panoramas') return home.interior.panoramas;
    if (section === 'works.items') return home.works.items;
    if (section === 'services.items') return home.services.items;
    if (section === 'specialists.items') return home.specialists.items;
    return home.profile.items;
  }

  private setList(home: HomeContentPayload, section: ItemSectionKey, list: ContentItem[]) {
    if (section === 'about.items') home.about.items = list;
    else if (section === 'certificates.items') home.certificates.items = list;
    else if (section === 'interior.items') home.interior.items = list;
    else if (section === 'interior.panoramas') home.interior.panoramas = list;
    else if (section === 'works.items') home.works.items = list;
    else if (section === 'services.items') home.services.items = list;
    else if (section === 'specialists.items') home.specialists.items = list;
    else home.profile.items = list;
  }

  private writeTextField(home: HomeContentPayload, field: TextFieldKey, value: string) {
    const text = value.trim();
    if (field === 'topHero.greetingTemplate') home.topHero.greetingTemplate = text;
    else if (field === 'topHero.title') home.topHero.title = text;
    else if (field === 'topHero.subtitle') home.topHero.subtitle = text;
    else if (field === 'topHero.backgroundColor') home.topHero.backgroundColor = text;
    else if (field === 'topHero.backgroundImageUrl') home.topHero.backgroundImageUrl = text;
    else if (field === 'expertBlock.title') home.expertBlock.title = text;
    else if (field === 'expertBlock.subtitle') home.expertBlock.subtitle = text;
    else if (field === 'expertBlock.description') home.expertBlock.description = text;
    else if (field === 'expertBlock.address') home.expertBlock.address = text;
    else if (field === 'expertBlock.mapUrl') home.expertBlock.mapUrl = text;
    else if (field === 'expertBlock.buttonText') home.expertBlock.buttonText = text;
    else if (field === 'expertBlock.backgroundColor') home.expertBlock.backgroundColor = text;
    else if (field === 'expertBlock.backgroundImageUrl') home.expertBlock.backgroundImageUrl = text;
    else if (field === 'about.title') home.about.title = text;
    else if (field === 'about.description') home.about.description = text;
    else if (field === 'certificates.title') home.certificates.title = text;
    else if (field === 'certificates.description') home.certificates.description = text;
    else if (field === 'interior.title') home.interior.title = text;
    else if (field === 'interior.description') home.interior.description = text;
    else if (field === 'works.title') home.works.title = text;
    else if (field === 'works.description') home.works.description = text;
    else if (field === 'services.title') home.services.title = text;
    else if (field === 'services.description') home.services.description = text;
    else if (field === 'specialists.title') home.specialists.title = text;
    else if (field === 'specialists.description') home.specialists.description = text;
    else if (field === 'profile.title') home.profile.title = text;
    else home.profile.description = text;
  }

  private newId(section: ItemSectionKey) {
    const prefix = section.replace(/\W+/g, '-').replace(/-items$/, '').replace(/-panoramas$/, '-360');
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private defaultTitle(section: ItemSectionKey) {
    if (section === 'services.items') return 'Новая услуга';
    if (section === 'specialists.items') return 'Новый специалист';
    if (section === 'certificates.items') return 'Сертификат';
    if (section === 'interior.panoramas') return '360° обзор';
    if (section === 'works.items') return 'Наша работа';
    if (section === 'profile.items') return 'Раздел профиля';
    return 'Новый блок';
  }

  private optional(value?: string) {
    const text = repairMojibake(value?.toString().trim() ?? '');
    return text === '' ? undefined : text;
  }

  private text(value: string | undefined, fallback: string) {
    const text = repairMojibake(value?.toString().trim() ?? '');
    return text === '' ? fallback : text;
  }
}

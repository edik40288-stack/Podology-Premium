import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { ChatService } from '../chat/chat.service';
import { DatabaseService } from '../database/database.service';
import { ProfileService } from '../profile/profile.service';
import { YclientsService } from '../yclients/yclients.service';
import { AuthUser } from './auth.types';

type PendingCode = {
  phone: string;
  firstName: string;
  lastName: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly pendingCodes = new Map<string, PendingCode>();
  private readonly codeRequestLog = new Map<string, number[]>();

  constructor(
    private readonly config: ConfigService,
    private readonly profiles: ProfileService,
    private readonly chat: ChatService,
    private readonly db: DatabaseService,
    private readonly yclients: YclientsService,
  ) {}

  async requestCode(input: { firstName?: string; lastName?: string; phone?: string }) {
    const firstName = this.cleanName(input.firstName);
    const lastName = this.cleanName(input.lastName);
    const phone = this.normalizePhone(input.phone);
    if (!firstName || !lastName || !phone) {
      throw new BadRequestException('firstName, lastName and phone are required');
    }
    this.assertCodeRequestRate(phone);

    if (this.isTestLogin({ firstName, lastName, phone })) {
      const profile = await this.profiles.save({ firstName, lastName, phone });
      await this.syncYclientsProfile(profile).catch((error: unknown) => this.logger.warn(`YCLIENTS profile sync skipped: ${error instanceof Error ? error.message : String(error)}`));
      return {
        ok: true,
        mode: 'test',
        autoVerified: true,
        token: this.issueToken({ phone: profile.phone, firstName: profile.firstName, lastName: profile.lastName, testMode: true }),
        profile: { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone, testMode: true },
      };
    }

    const mode = this.authMode;
    const code = mode === 'local_demo' ? this.localDemoCode : this.generateCode();
    this.pendingCodes.set(phone, {
      phone,
      firstName,
      lastName,
      code,
      expiresAt: Date.now() + this.codeTtlSeconds * 1000,
      attempts: 0,
    });

    if (mode === 'sms_ru') {
      await this.sendSmsRu(phone, code);
      return { ok: true, mode, codeRequired: true, message: 'SMS code sent' };
    }

    if (this.isProduction) {
      throw new InternalServerErrorException('Production auth requires real SMS provider');
    }

    return { ok: true, mode: 'local_demo', codeRequired: true, demoCode: code, message: 'Local demo code generated' };
  }

  async verifyCode(input: { firstName?: string; lastName?: string; phone?: string; code?: string }) {
    const firstName = this.cleanName(input.firstName);
    const lastName = this.cleanName(input.lastName);
    const phone = this.normalizePhone(input.phone);
    const code = (input.code ?? '').trim();
    if (!phone || !code) throw new BadRequestException('phone and code are required');

    const pending = this.pendingCodes.get(phone);
    if (!pending) throw new UnauthorizedException('Code was not requested or expired');
    if (pending.expiresAt < Date.now()) {
      this.pendingCodes.delete(phone);
      throw new UnauthorizedException('Code expired');
    }
    pending.attempts += 1;
    if (pending.attempts > 5) {
      this.pendingCodes.delete(phone);
      throw new ForbiddenException('Too many verification attempts');
    }
    if (pending.code !== code) throw new UnauthorizedException('Invalid code');

    this.pendingCodes.delete(phone);
    const profile = await this.profiles.save({
      firstName: firstName || pending.firstName,
      lastName: lastName || pending.lastName,
      phone,
    });
    await this.syncYclientsProfile(profile).catch((error: unknown) => this.logger.warn(`YCLIENTS profile sync skipped: ${error instanceof Error ? error.message : String(error)}`));
    return {
      ok: true,
      mode: this.authMode,
      token: this.issueToken({ phone: profile.phone, firstName: profile.firstName, lastName: profile.lastName }),
      profile: { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone, testMode: false },
    };
  }

  async deleteAccount(user: AuthUser) {
    const profile = await this.profiles.deleteByPhone(user.phone);
    const chat = await this.deleteChatDataByPhone(user.phone);
    const bookings = await this.deleteBookingsByPhone(user.phone);
    const yclients = await this.yclients.requestClientErasure(user.phone).catch((error: unknown) => ({ ok: false, source: 'yclients', error: error instanceof Error ? error.message : String(error) }));
    return { ok: true, deleted: true, profile, chat, bookings, yclients };
  }

  private async syncYclientsProfile(profile: { phone: string; firstName?: string; lastName?: string }) {
    return this.yclients.syncClientProfile({ phone: profile.phone, firstName: profile.firstName, lastName: profile.lastName });
  }

  private async deleteChatDataByPhone(phone: string) {
    const roomId = `client-${phone.replace(/[^0-9]+/g, '')}`;
    const result = await this.chat.deleteRoom(roomId);
    for (const mediaUrl of result.mediaUrls) {
      await this.deleteMediaUrl(mediaUrl);
    }
    return { roomId, deleted: result.deleted, mediaFilesRequestedForDeletion: result.mediaUrls.length };
  }

  private async deleteMediaUrl(mediaUrl: string) {
    if (!mediaUrl.startsWith('/media/public/chat/')) return;
    const filename = basename(mediaUrl);
    if (!filename) return;
    try {
      await unlink(join(process.cwd(), 'storage', 'chat', filename));
    } catch {
      // File can be absent already.
    }
  }

  private async deleteBookingsByPhone(phone: string) {
    const normalized = this.normalizePhone(phone);
    if (this.db.isPostgres) {
      const result = await this.db.query('delete from bookings where phone = $1', [normalized]);
      return { phone: normalized, deleted: result.rowCount ?? 0 };
    }
    const path = join(process.cwd(), 'data', 'bookings.json');
    try {
      const raw = await readFile(path, 'utf8');
      const parsed = JSON.parse(raw) as { version?: number; bookings?: Array<{ phone?: string }> };
      const before = parsed.bookings?.length ?? 0;
      parsed.bookings = (parsed.bookings ?? []).filter((item) => item.phone !== normalized);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, `${JSON.stringify({ version: 1, bookings: parsed.bookings }, null, 2)}\n`, 'utf8');
      return { phone: normalized, deleted: before - parsed.bookings.length };
    } catch {
      return { phone: normalized, deleted: 0 };
    }
  }

  verifyAuthorizationHeader(header?: string | string[]): AuthUser {
    const raw = Array.isArray(header) ? header[0] : header;
    if (!raw || !raw.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');
    return this.verifyToken(raw.slice('Bearer '.length).trim());
  }

  issueToken(input: { phone: string; firstName?: string; lastName?: string; testMode?: boolean }) {
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthUser = {
      phone: this.normalizePhone(input.phone),
      firstName: input.firstName,
      lastName: input.lastName,
      testMode: input.testMode === true,
      exp: now + this.tokenTtlSeconds,
    };
    const body = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(body);
    return `${body}.${signature}`;
  }

  verifyToken(token: string): AuthUser {
    const [body, signature] = token.split('.');
    if (!body || !signature) throw new UnauthorizedException('Invalid token');
    const expected = this.sign(body);
    if (!this.safeEqual(signature, expected)) throw new UnauthorizedException('Invalid token signature');
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AuthUser;
    if (!parsed.phone || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }
    return { ...parsed, phone: this.normalizePhone(parsed.phone) };
  }

  normalizePhone(value?: string) {
    const text = (value ?? '').toString().trim();
    const plus = text.startsWith('+') ? '+' : '';
    const digits = text.replace(/[^0-9]/g, '');
    return digits ? `${plus}${digits}` : '';
  }

  private async sendSmsRu(phone: string, code: string) {
    const apiId = this.config.get<string>('SMS_RU_API_ID')?.trim();
    if (!apiId || apiId.startsWith('put_')) {
      throw new InternalServerErrorException('SMS_RU_API_ID is not configured');
    }
    const to = phone.replace(/[^0-9]/g, '');
    const msg = `Код входа PODOLOG KUTSYTOI: ${code}`;
    try {
      const { data } = await axios.get('https://sms.ru/sms/send', {
        timeout: 10_000,
        params: { api_id: apiId, to, msg, json: 1 },
      });
      if (!data || data.status !== 'OK') {
        this.logger.error(`SMS.ru failed: ${JSON.stringify(data)}`);
        throw new InternalServerErrorException('SMS provider rejected message');
      }
    } catch (error) {
      this.logger.error('SMS sending failed', error instanceof Error ? error.stack : String(error));
      throw new InternalServerErrorException('SMS sending failed');
    }
  }

  private isTestLogin(input: { firstName: string; lastName: string; phone: string }) {
    if (!this.bool('TEST_MODE_ENABLED')) return false;
    const first = this.config.get<string>('TEST_MODE_FIRST_NAME')?.trim().toLowerCase();
    const last = this.config.get<string>('TEST_MODE_LAST_NAME')?.trim().toLowerCase();
    const phone = this.normalizePhone(this.config.get<string>('TEST_MODE_PHONE'));
    if (!first || !last || !phone || first.startsWith('put_') || last.startsWith('put_')) return false;
    return input.firstName.toLowerCase() === first && input.lastName.toLowerCase() === last && input.phone === phone;
  }

  private assertCodeRequestRate(phone: string) {
    const now = Date.now();
    const windowMs = Number(this.config.get<string>('AUTH_CODE_RATE_WINDOW_SECONDS') ?? 900) * 1000;
    const maxRequests = Number(this.config.get<string>('AUTH_CODE_RATE_MAX') ?? 3);
    const recent = (this.codeRequestLog.get(phone) ?? []).filter((value) => now - value < windowMs);
    if (recent.length >= maxRequests) {
      throw new ForbiddenException('Too many code requests. Please try again later.');
    }
    recent.push(now);
    this.codeRequestLog.set(phone, recent);
  }

  private generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private cleanName(value?: string) {
    return (value ?? '').toString().trim().replace(/\s+/g, ' ');
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private sign(body: string) {
    return createHmac('sha256', this.jwtSecret).update(body).digest('base64url');
  }

  private safeEqual(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  }

  private bool(name: string) {
    return ['1', 'true', 'yes', 'on'].includes((this.config.get<string>(name) ?? '').toLowerCase());
  }

  private get authMode() {
    return (this.config.get<string>('AUTH_MODE') ?? (this.isProduction ? 'sms_ru' : 'local_demo')).trim();
  }

  private get isProduction() {
    return (this.config.get<string>('APP_ENV') ?? 'local').toLowerCase() === 'production';
  }

  private get localDemoCode() {
    return this.config.get<string>('LOCAL_DEMO_CODE')?.trim() || '1111';
  }

  private get codeTtlSeconds() {
    return Number(this.config.get<string>('AUTH_CODE_TTL_SECONDS') ?? 300);
  }

  private get tokenTtlSeconds() {
    return Number(this.config.get<string>('AUTH_TOKEN_TTL_SECONDS') ?? 60 * 60 * 24 * 30);
  }

  private get jwtSecret() {
    const value = this.config.get<string>('APP_JWT_SECRET')?.trim();
    if (value && !value.startsWith('put_') && value.length >= 32) return value;
    if (this.isProduction) throw new InternalServerErrorException('APP_JWT_SECRET must be set in production');
    return 'local-dev-only-secret-change-before-release-32chars';
  }
}

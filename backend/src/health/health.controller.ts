import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService, private readonly config: ConfigService) {}

  @Get()
  health() {
    return {
      ok: true,
      service: 'podology-premium-backend',
      version: '3.10.7-p56-run-checked-thin-backend',
      operatingModel: this.config.get<string>('APP_OPERATING_MODEL') ?? 'full',
      bookingProvider: this.config.get<string>('BOOKING_PROVIDER') ?? 'app_cache',
      profileProvider: this.config.get<string>('PROFILE_PROVIDER') ?? 'app_cache',
      chatProvider: this.config.get<string>('CHAT_PROVIDER') ?? 'backend_telegram',
      chatMediaPrimary: this.config.get<string>('CHAT_MEDIA_PRIMARY') ?? 'backend',
      storage: this.db.isPostgres ? 'postgres' : 'json',
      time: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    if (this.db.isPostgres) await this.db.query('select 1');
    return {
      ok: true,
      operatingModel: this.config.get<string>('APP_OPERATING_MODEL') ?? 'full',
      storage: this.db.isPostgres ? 'postgres' : 'json',
      time: new Date().toISOString(),
    };
  }
}

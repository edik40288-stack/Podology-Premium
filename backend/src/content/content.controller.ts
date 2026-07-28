import { Body, Controller, Get, Headers, Put, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ContentService } from './content.service';
import type { HomeContentPayload } from './types';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService, private readonly config: ConfigService) {}

  @Get('home')
  getHome() {
    return this.content.getHome();
  }

  @Get('summary')
  async summary() {
    return { ok: true, data: await this.content.summary() };
  }

  @Put('home')
  async updateHome(@Body() body: HomeContentPayload, @Headers('x-admin-token') token?: string) {
    this.checkAdminToken(token);
    return this.content.saveHome(body);
  }

  private checkAdminToken(token?: string) {
    const expectedToken = this.config.get<string>('CONTENT_ADMIN_TOKEN')?.trim();
    if (expectedToken && token !== expectedToken) throw new UnauthorizedException('Invalid content admin token');
  }
}

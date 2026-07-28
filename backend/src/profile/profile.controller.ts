import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { YclientsService } from '../yclients/yclients.service';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService, private readonly yclients: YclientsService) {}

  @Get()
  async get(@Req() request: AuthenticatedRequest) {
    return { ok: true, data: await this.profile.get(request.user.phone) };
  }

  @Put()
  async save(
    @Req() request: AuthenticatedRequest,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      chatNotifications?: boolean;
      bookingNotifications?: boolean;
      marketingNotifications?: boolean;
    },
  ) {
    const data = await this.profile.save({ ...body, phone: request.user.phone });
    const yclientsSync = await this.yclients
      .syncClientProfile({ phone: data.phone, firstName: data.firstName, lastName: data.lastName })
      .catch((error: unknown) => ({ ok: false, source: 'yclients', error: error instanceof Error ? error.message : String(error) }));
    return { ok: true, data, yclientsSync };
  }
}

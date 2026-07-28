import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('request-code')
  requestCode(@Body() body: { firstName?: string; lastName?: string; phone?: string }) {
    return this.auth.requestCode(body);
  }

  @Post('verify-code')
  verifyCode(@Body() body: { firstName?: string; lastName?: string; phone?: string; code?: string }) {
    return this.auth.verifyCode(body);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Req() request: AuthenticatedRequest) {
    return this.auth.deleteAccount(request.user);
  }
}

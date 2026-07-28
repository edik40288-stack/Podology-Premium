import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';

export type AuthenticatedRequest = Request & { user: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = this.auth.verifyAuthorizationHeader(request.headers.authorization);
    return true;
  }
}

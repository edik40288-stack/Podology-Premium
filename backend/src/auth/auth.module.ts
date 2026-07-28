import { Global, Module } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { ProfileModule } from '../profile/profile.module';
import { YclientsModule } from '../yclients/yclients.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [ProfileModule, ChatModule, YclientsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

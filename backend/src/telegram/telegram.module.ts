import { Module, forwardRef } from '@nestjs/common';

import { ChatModule } from '../chat/chat.module';
import { ContentModule } from '../content/content.module';
import { MediaModule } from '../media/media.module';

import { TelegramAdminService } from './telegram-admin.service';
import { TelegramChatBridgeService } from './telegram-chat-bridge.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [ContentModule, MediaModule, forwardRef(() => ChatModule)],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramAdminService, TelegramChatBridgeService],
  exports: [TelegramService],
})
export class TelegramModule {}

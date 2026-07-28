import { Module, forwardRef } from '@nestjs/common';

import { TelegramModule } from '../telegram/telegram.module';

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({ imports: [forwardRef(() => TelegramModule)], controllers: [ChatController], providers: [ChatGateway, ChatService], exports: [ChatService] })
export class ChatModule {}

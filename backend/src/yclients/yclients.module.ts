import { Module, forwardRef } from '@nestjs/common';

import { ContentModule } from '../content/content.module';
import { TelegramModule } from '../telegram/telegram.module';

import { YclientsController } from './yclients.controller';
import { YclientsService } from './yclients.service';

@Module({
  imports: [ContentModule, forwardRef(() => TelegramModule)],
  controllers: [YclientsController],
  providers: [YclientsService],
  exports: [YclientsService],
})
export class YclientsModule {}

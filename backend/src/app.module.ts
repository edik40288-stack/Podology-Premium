import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CareCardModule } from './care-card/care-card.module';
import { ChatModule } from './chat/chat.module';
import { ContentModule } from './content/content.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { ProfileModule } from './profile/profile.module';
import { TelegramModule } from './telegram/telegram.module';
import { YclientsModule } from './yclients/yclients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ContentModule,
    YclientsModule,
    CareCardModule,
    ChatModule,
    MediaModule,
    TelegramModule,
    ProfileModule,
  ],
})
export class AppModule {}

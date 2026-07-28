import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { requireProductionEnv } from './common/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  requireProductionEnv(config);

  const corsOrigin = config.get<string>('CORS_ORIGIN')?.trim();
  app.enableCors({ origin: corsOrigin || true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.listen(config.get<number>('PORT') ?? 3000);
}

bootstrap();

import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { CareCardController } from './care-card.controller';
import { CareCardService } from './care-card.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CareCardController],
  providers: [CareCardService],
  exports: [CareCardService],
})
export class CareCardModule {}

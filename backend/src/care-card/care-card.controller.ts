import { Body, Controller, Get, Put, Query } from '@nestjs/common';

import { CareCardService } from './care-card.service';

@Controller('care-card')
export class CareCardController {
  constructor(private readonly careCard: CareCardService) {}

  @Get()
  async get(@Query('phone') phone = '') {
    const data = await this.careCard.get(phone);
    return { success: true, source: 'care-card', data };
  }

  @Put()
  async put(@Body() body: Record<string, unknown>) {
    const phone = body.phone?.toString().trim() ?? '';
    const data = await this.careCard.save({ ...body, phone } as never);
    return { success: true, source: 'care-card', data };
  }
}

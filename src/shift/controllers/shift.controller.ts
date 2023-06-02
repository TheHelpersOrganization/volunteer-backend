import { Controller, Get, Param } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { ShiftOutputDto } from '../dtos';
import { ShiftService } from '../services';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.shiftService.getById(context, id);
  }
}

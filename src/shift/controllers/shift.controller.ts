import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { ShiftOutputDto, UpdateShiftInputDto } from '../dtos';
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

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    return this.shiftService.update(context, id, dto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.shiftService.delete(context, id);
  }
}

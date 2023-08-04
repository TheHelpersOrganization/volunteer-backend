import { ReqContext, RequestContext } from '@app/common/request-context';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShiftOutputDto } from '../dtos';
import { GetShiftsQueryDto } from '../dtos/get-shift.query.dto';
import { ModShiftService } from '../services';

@Controller('mod/shifts')
export class ModShiftController {
  constructor(private readonly modShiftService: ModShiftService) {}

  @Get()
  async get(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftsQueryDto,
  ): Promise<ShiftOutputDto[]> {
    return this.modShiftService.getShifts(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.modShiftService.getShiftById(context, id);
  }
}

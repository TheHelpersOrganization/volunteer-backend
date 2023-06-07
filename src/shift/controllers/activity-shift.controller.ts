import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { CreateShiftInputDto, ShiftOutputDto } from '../dtos';
import { ShiftService } from '../services';

@Controller('activities/:activityId/shifts')
export class ActivityShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  async getByActivityId(
    @ReqContext() context: RequestContext,
    @Param('activityId') activityId: number,
  ): Promise<ShiftOutputDto[]> {
    return this.shiftService.getByActivityId(context, activityId);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Param('activityId') activityId: number,
    @Body() dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    return this.shiftService.createShift(context, dto);
  }
}

import { BaseApiResponse } from '@app/common/dtos';
import { ReqContext, RequestContext } from '@app/common/request-context';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetShiftVolunteerQueryDto, ShiftVolunteerOutputDto } from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('shift-volunteers')
export class ShiftVolunteerController {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

  @Get()
  async getShiftVolunteers(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftVolunteerQueryDto,
  ): Promise<BaseApiResponse<ShiftVolunteerOutputDto[]>> {
    return this.shiftVolunteerService.getShiftVolunteers(context, query);
  }

  @Get(':id')
  async getShiftVolunteerById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    return this.shiftVolunteerService.getById(context, id);
  }

  @Get('me')
  async getMyShiftVolunteers(@ReqContext() context: RequestContext) {
    return this.shiftVolunteerService.getMe(context);
  }
}

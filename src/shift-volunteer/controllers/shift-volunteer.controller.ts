import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { GetShiftVolunteerQueryDto, ShiftVolunteerOutputDto } from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('shift-volunteers')
export class ShiftVolunteerController {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

  @Get()
  async getShiftVolunteers(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftVolunteerQueryDto,
  ): Promise<ShiftVolunteerOutputDto[]> {
    return this.shiftVolunteerService.getShiftVolunteers(context, query);
  }

  @Get(':id')
  async getShiftVolunteerById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    return this.shiftVolunteerService.getById(context, id);
  }
}

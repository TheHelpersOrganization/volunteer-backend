import { ReqContext, RequestContext } from '@app/common/request-context';
import { Controller, Get, Query } from '@nestjs/common';
import { ActivityVolunteerQueryDto } from '../dtos/activity-volunteer.query.dto';
import { ShiftVolunteerService } from '../services';

@Controller('activity-volunteers')
export class ActivityVolunteerController {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

  @Get()
  async getVolunteers(
    @ReqContext() context: RequestContext,
    @Query() query: ActivityVolunteerQueryDto,
  ) {
    return this.shiftVolunteerService.getApprovedActivityVolunteers(
      context,
      query,
    );
  }
}

import { ReqContext, RequestContext } from '@app/common/request-context';
import { Controller, Get, Param } from '@nestjs/common';
import { ShiftVolunteerOutputDto } from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('activities/:activityId/volunteers')
export class ActivityVolunteer {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

  @Get()
  async getVolunteers(
    @ReqContext() context: RequestContext,
    @Param('activityId') activityId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    return this.shiftVolunteerService.getApprovedByActivityId(
      context,
      activityId,
    );
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import {
  ActivityOutputDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
} from '../dtos';
import { ActivityService } from '../services';

@RequireRoles(Role.Volunteer)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
    @Query() query: GetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    return this.activityService.getAll(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetActivityByIdQueryDto,
  ): Promise<ActivityOutputDto | null> {
    return this.activityService.getById(context, id, query);
  }
}

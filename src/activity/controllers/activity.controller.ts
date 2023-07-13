import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import {
  ActivityOutputDto,
  CountActivityOutputDto,
  CountActivityQueryDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { ActivityService } from '../services';

@RequireRoles(Role.Volunteer)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getActivities(
    @ReqContext() context: RequestContext,
    @Query() query: GetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    return this.activityService.getAll(context, query);
  }

  @Get('count')
  async countActivities(
    @ReqContext() context: RequestContext,
    @Query() query: CountActivityQueryDto,
  ): Promise<CountActivityOutputDto> {
    return this.activityService.countActivities(context, query);
  }

  @Get(':id')
  async getActivityById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetActivityByIdQueryDto,
  ): Promise<ActivityOutputDto | null> {
    return this.activityService.getById(context, id, query);
  }

  @Put(':id')
  async updateActivity(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    return this.activityService.updateActivity(context, id, dto);
  }

  @Delete(':id')
  async deleteActivity(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ActivityOutputDto> {
    return this.activityService.deleteActivity(context, id);
  }

  @Get('suggest')
  async suggestActivities(@ReqContext() context: RequestContext) {
    return this.activityService.suggestActivities(context);
  }
}

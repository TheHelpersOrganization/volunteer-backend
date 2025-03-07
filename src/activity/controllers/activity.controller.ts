import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Role } from '@app/auth/constants';
import { RequireRoles } from '@app/auth/decorators';
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

  @Get('search/history')
  async getSearchActivityHistories(@ReqContext() context: RequestContext) {
    return this.activityService.getSearchHistory(context);
  }

  @Get('count')
  async countActivities(
    @ReqContext() context: RequestContext,
    @Query() query: CountActivityQueryDto,
  ): Promise<CountActivityOutputDto> {
    return this.activityService.countActivities(context, query);
  }

  @Get('suggest')
  async suggestActivities(
    @ReqContext() context: RequestContext,
    @Query() query: GetActivitiesQueryDto,
  ) {
    return this.activityService.suggestActivities(context, query);
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

  @RequireRoles(Role.Admin)
  @Post(':id/disable')
  async banActivity(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityOutputDto> {
    return this.activityService.banActivity(context, id);
  }

  @RequireRoles(Role.Admin)
  @Post(':id/enable')
  async unbanActivity(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityOutputDto> {
    return this.activityService.unbanActivity(context, id);
  }

  @RequireRoles(Role.Operator)
  @Post('ratings/refresh')
  async refreshActivityRatings(
    @ReqContext() context: RequestContext,
  ): Promise<boolean> {
    return this.activityService.refreshActivityRatings(context);
  }
}

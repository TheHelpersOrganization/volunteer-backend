import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  ActivityOutputDto,
  CreateActivityInputDto,
  ModGetActivitiesQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { ModActivityService } from '../services';

@RequireRoles(Role.Moderator)
@Controller('mod/organizations/:organizationId/activities')
export class ModActivityController {
  constructor(private readonly modActivityService: ModActivityService) {}

  @Get()
  async getActivities(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Query() query: ModGetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    return this.modActivityService.getActivities(
      context,
      organizationId,
      query,
    );
  }

  @Post()
  async createActivity(
    @ReqContext() context: RequestContext,
    @Param('organizationId') organizationId: number,
    @Body() dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    return this.modActivityService.createActivity(context, organizationId, dto);
  }

  @Put(':id')
  async updateActivity(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    return this.modActivityService.updateActivity(context, id, dto);
  }
}

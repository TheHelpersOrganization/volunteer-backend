import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { OrganizationMemberRole } from 'src/organization/constants';
import { OrganizationRoleService } from 'src/organization/services';
import {
  ActivityOutputDto,
  CreateActivityInputDto,
  ModGetActivitiesQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { ActivityRoleService, ModActivityService } from '../services';

@RequireRoles(Role.Moderator)
@Controller('mod/organizations/:organizationId/activities')
export class ModActivityController {
  constructor(
    private readonly modActivityService: ModActivityService,
    private readonly organizationRoleService: OrganizationRoleService,
    private readonly activityRoleService: ActivityRoleService,
  ) {}

  @Get()
  async getActivities(
    @ReqContext() context: RequestContext,
    @Param('organizationId', ParseIntPipe) organizationId: number,
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
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    await this.organizationRoleService.validateAccountMemberHasRole(
      organizationId,
      context.account.id,
      OrganizationMemberRole.ActivityManager,
    );
    return this.modActivityService.createActivity(context, organizationId, dto);
  }

  @Put(':id')
  async updateActivity(
    @ReqContext() context: RequestContext,
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    await this.activityRoleService.validateAccountMemberCanManageActivity({
      organizationId,
      accountId: context.account.id,
      activityId: id,
    });
    return this.modActivityService.updateActivity(
      context,
      organizationId,
      id,
      dto,
    );
  }
}

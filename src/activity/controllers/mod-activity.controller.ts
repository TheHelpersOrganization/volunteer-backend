import { Controller, Get, Param, Query } from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { RequireRoles } from 'src/auth/decorators';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { ActivityOutputDto, ModGetActivitiesQueryDto } from '../dtos';
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
}

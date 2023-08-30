import { ReqContext, RequestContext } from '@app/common/request-context';
import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsQueryDto } from '../dtos';
import { AnalyticsService } from '../services';

@Controller('analytics/rankings')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('accounts')
  async getAccountsRankings(
    @ReqContext() context: RequestContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getAccountRankings(context, query);
  }

  @Get('organizations')
  async getOrganizationsRankings(
    @ReqContext() context: RequestContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getOrganizationRankings(context, query);
  }

  @Get('activities')
  async getActivitiesRankings(
    @ReqContext() context: RequestContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getActivityRankings(context, query);
  }
}

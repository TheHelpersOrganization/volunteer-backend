import { ActivityService } from '@app/activity/services';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { PrismaService } from '@app/prisma';
import { getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService, ProfileSkillService } from '@app/profile/services';
import { RedisService } from '@app/redis/services';
import { ShiftStatus } from '@app/shift/constants';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import {
  ANALYTICS_LAST_UPDATED_KEY,
  ANALYTICS_TOP_ACCOUNTS_KEY,
  ANALYTICS_TOP_ORGANIZATIONS_KEY,
} from '../constants';
import { AccountRankingOutputDto, AnalyticsQueryDto } from '../dtos';
import { AnalyticsTaskService } from '../tasks';

@Injectable()
export class AnalyticsService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly profileSkillService: ProfileSkillService,
    private readonly activityService: ActivityService,
    private readonly analyticsTaskService: AnalyticsTaskService,
    private readonly redis: RedisService,
  ) {
    super(logger);
  }

  async getAccountRankings(context: RequestContext, query: AnalyticsQueryDto) {
    const lastUpdated = await this.redis.get(ANALYTICS_LAST_UPDATED_KEY);
    if (
      !lastUpdated ||
      dayjs(lastUpdated).isBefore(dayjs().subtract(24, 'hour'))
    ) {
      return this.refreshAnalytics(context);
    }

    const topAccountsStr = await this.redis.get(ANALYTICS_TOP_ACCOUNTS_KEY);
    const topAccounts = JSON.parse(topAccountsStr!).slice(0, query.limit);
    const profiles = (
      await this.profileService.getProfiles(context, {
        ids: topAccounts.map((topAccount) => topAccount.accountId),
        select: getProfileBasicSelect,
      })
    )
      .map((profile) => ({
        ...profile,
        hoursContributed:
          topAccounts.find((topAccount) => topAccount.accountId === profile.id)
            ?.hoursContributed ?? 0,
      }))
      .sort((a, b) => b.hoursContributed - a.hoursContributed);

    return this.outputArray(AccountRankingOutputDto, profiles);
  }

  async getOrganizationRankings(
    context: RequestContext,
    query: AnalyticsQueryDto,
  ) {
    // Check the cache to get the top organizations
    const lastUpdated = await this.redis.get(ANALYTICS_LAST_UPDATED_KEY);
    if (
      lastUpdated ||
      dayjs(lastUpdated).isBefore(dayjs().subtract(24, 'hour'))
    ) {
      await this.refreshAnalytics(context);
    }

    const topOrganizationsStr = await this.redis.get(
      ANALYTICS_TOP_ORGANIZATIONS_KEY,
    );
    const topOrganizations = JSON.parse(topOrganizationsStr!).slice(
      0,
      query.limit,
    );

    let organizations = await this.prisma.organization.findMany({
      where: {
        id: {
          in: topOrganizations.map(
            (topOrganization) => topOrganization.organizationId,
          ),
        },
      },
    });
    organizations = organizations.map((organization) => ({
      ...organization,
      hoursContributed:
        topOrganizations.find(
          (topOrganization) =>
            topOrganization.organizationId === organization.id,
        )?.hoursContributed ?? 0,
    }));
    organizations.sort((a, b) => b.hoursContributed - a.hoursContributed);

    return this.outputArray(OrganizationOutputDto, organizations);
  }

  async getActivityRankings(context: RequestContext, query: AnalyticsQueryDto) {
    // Within one month and completed
    const mostParticipantsShifts = await this.prisma.shift.groupBy({
      by: ['activityId'],
      where: {
        status: ShiftStatus.Completed,
        startTime: {
          gt: dayjs().subtract(1, 'month').toDate(),
        },
      },
      _sum: {
        joinedParticipants: true,
      },
      orderBy: {
        _sum: {
          joinedParticipants: 'desc',
        },
      },
    });
    const mostParticipantsActivityIds = mostParticipantsShifts.map(
      (mostParticipantsShift) => mostParticipantsShift.activityId,
    );
    const mostParticipantsActivities = await this.activityService.getAll(
      context,
      {
        ids: mostParticipantsActivityIds,
        limit: query.limit,
      },
      {
        recordHistory: false,
      },
    );
    return mostParticipantsActivities.sort(
      (a, b) => b.joinedParticipants - a.joinedParticipants,
    );
  }

  async refreshAnalytics(context: RequestContext) {
    await this.analyticsTaskService.refreshAnalytics();
  }
}

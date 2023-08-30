import { ActivityService } from '@app/activity/services';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { requireNonNull } from '@app/common/utils';
import { OrganizationOutputDto } from '@app/organization/dtos';
import { PrismaService } from '@app/prisma';
import { getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService, ProfileSkillService } from '@app/profile/services';
import { Injectable } from '@nestjs/common';
import { AccountRankingOutputDto, AnalyticsQueryDto } from '../dtos';

@Injectable()
export class AnalyticsService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly profileSkillService: ProfileSkillService,
    private readonly activityService: ActivityService,
  ) {
    super(logger);
  }

  async getAccountRankings(context: RequestContext, query: AnalyticsQueryDto) {
    const totalHours = await this.prisma.profileSkill.groupBy({
      by: ['profileId'],
      _sum: {
        hours: true,
      },
      orderBy: {
        _sum: {
          hours: 'desc',
        },
      },
      take: query.limit,
    });
    const profiles = await this.profileService.getProfiles(context, {
      ids: totalHours.map((totalHour) => totalHour.profileId),
      select: getProfileBasicSelect,
    });
    const output: AccountRankingOutputDto[] = totalHours.map((totalHour) => ({
      ...requireNonNull(
        profiles.find((profile) => profile.id === totalHour.profileId),
      ),
      hoursContributed: totalHour._sum.hours ?? 0,
    }));
    return this.outputArray(AccountRankingOutputDto, output);
  }

  async getOrganizationRankings(
    context: RequestContext,
    query: AnalyticsQueryDto,
  ) {
    const organizations = await this.prisma.organization.findMany({
      orderBy: {
        hoursContributed: 'desc',
      },
      take: query.limit,
    });
    return this.outputArray(OrganizationOutputDto, organizations);
  }

  async getActivityRankings(context: RequestContext, query: AnalyticsQueryDto) {
    const mostParticipantsShifts = await this.prisma.shift.groupBy({
      by: ['activityId'],
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
    );
    return mostParticipantsActivities.sort(
      (a, b) => b.joinedParticipants - a.joinedParticipants,
    );
  }
}

import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis/services';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { ShiftStatus } from '@app/shift/constants';
import { Injectable } from '@nestjs/common';
import { Interval, Timeout } from '@nestjs/schedule';
import dayjs from 'dayjs';
import {
  ANALYTICS_LAST_UPDATED_KEY,
  ANALYTICS_TOP_ACCOUNTS_KEY,
  ANALYTICS_TOP_ORGANIZATIONS_KEY,
} from '../constants';

@Injectable()
export class AnalyticsTaskService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super(logger);
  }

  private isRunning = false;

  // Run every day
  @Interval(1000 * 60 * 60 * 24)
  @Timeout(1000 * 60 * 10)
  async refreshAnalytics() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    try {
      this.logger.log(undefined, 'Running analytics task');
      // Check the cache to see if the analytics have been updated in the last 24 hours
      const lastUpdated = await this.redis.get(ANALYTICS_LAST_UPDATED_KEY);
      if (lastUpdated) {
        const lastUpdatedDate = dayjs(lastUpdated);
        if (lastUpdatedDate.isAfter(dayjs().subtract(24, 'hour'))) {
          return;
        }
      }

      // Get all shifts that are in the past within one month
      const findMany = {
        where: {
          startTime: {
            gt: dayjs().subtract(1, 'month').toDate(),
          },
          status: ShiftStatus.Completed,
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          shiftVolunteers: {
            where: {
              status: ShiftVolunteerStatus.Approved,
            },
            select: {
              accountId: true,
              completion: true,
            },
          },
          activity: {
            select: {
              organizationId: true,
            },
          },
        },
        take: 1000,
      };
      let shifts = await this.prisma.shift.findMany(findMany);

      const accountRankings: { [accountId: number]: number } = {};
      const organizationsRankings: { [organizationId: number]: number } = {};

      while (shifts.length > 0) {
        // Find volunteers with most contributions
        const volunteersWithOrg = shifts.flatMap((shift) =>
          shift.shiftVolunteers.map((shiftVolunteer) => ({
            accountId: shiftVolunteer.accountId,
            organizationId: shift.activity.organizationId,
            duration: dayjs(shift.endTime).diff(shift.startTime, 'hour'),
            completion: shiftVolunteer.completion,
          })),
        );

        volunteersWithOrg.forEach((volunteer) => {
          if (!accountRankings[volunteer.accountId]) {
            accountRankings[volunteer.accountId] = 0;
          }
          accountRankings[volunteer.accountId] +=
            volunteer.duration * (volunteer.completion ?? 0);

          if (!organizationsRankings[volunteer.organizationId]) {
            organizationsRankings[volunteer.organizationId] = 0;
          }
          organizationsRankings[volunteer.organizationId] +=
            volunteer.duration * (volunteer.completion ?? 0);
        });

        shifts = await this.prisma.shift.findMany({
          ...findMany,
          cursor: {
            id: shifts[shifts.length - 1].id,
          },
          skip: 1,
        });
      }

      // Find top 100 accounts
      const accountRankingsArray = Object.entries(accountRankings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([accountId, hoursContributed]) => ({
          accountId: Number(accountId),
          hoursContributed,
        }));
      const organizationsRankingsArray = Object.entries(organizationsRankings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([organizationId, hoursContributed]) => ({
          organizationId: Number(organizationId),
          hoursContributed,
        }));

      // Save to redis and date to be used by analytics
      await this.redis.set(
        ANALYTICS_TOP_ACCOUNTS_KEY,
        JSON.stringify(accountRankingsArray),
      );

      await this.redis.set(
        ANALYTICS_TOP_ORGANIZATIONS_KEY,
        JSON.stringify(organizationsRankingsArray),
      );

      await this.redis.set(ANALYTICS_LAST_UPDATED_KEY, dayjs().toISOString());
    } finally {
      this.isRunning = false;
    }
  }
}

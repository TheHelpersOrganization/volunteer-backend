import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { ActivityService } from 'src/activity/services';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftStatus } from '../constants';

@Injectable()
export class ShiftTaskService extends AbstractService {
  private isRunning = false;

  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {
    super(logger);
  }

  // Perform automatic status update for shifts
  // Need to use cursor to get data slowly
  // Need to use cron job to run this task every 3 minutes
  //@Interval(2 * 60 * 60 * 1000)
  @Interval(3 * 60 * 1000)
  async updateShiftVolunteerStatus() {
    this.logCaller(undefined, this.updateShiftVolunteerStatus);
    // Guard to prevent multiple runs
    if (this.isRunning) {
      this.logger.warn(undefined, 'Task is already running. Skip this run.');
      return;
    }
    try {
      this.isRunning = true;
      const where: Prisma.ShiftWhereInput = {
        OR: [
          {
            status: ShiftStatus.Pending,
            automaticStatusUpdate: true,
            startTime: {
              lte: new Date(),
            },
          },
          {
            status: ShiftStatus.Ongoing,
            automaticStatusUpdate: true,
            OR: [
              {
                startTime: {
                  gt: new Date(),
                },
              },
              {
                endTime: {
                  lte: new Date(),
                },
              },
            ],
          },
          {
            status: ShiftStatus.Completed,
            automaticStatusUpdate: true,
            endTime: {
              gt: new Date(),
            },
          },
        ],
      };
      // Query first 100 records
      let res = await this.prisma.shift.findMany({
        where: where,
        take: 100,
      });
      // Then query next 100 records using cursor until no more records
      while (res.length > 0) {
        const updateToPending: number[] = [];
        const updateToOngoing: number[] = [];
        const updateToCompleted: number[] = [];
        res.forEach((shift) => {
          if (shift.startTime > new Date()) {
            updateToPending.push(shift.id);
          }
          if (shift.startTime <= new Date() && shift.endTime > new Date()) {
            updateToOngoing.push(shift.id);
          }
          if (shift.endTime <= new Date()) {
            updateToCompleted.push(shift.id);
          }
        });
        if (updateToPending.length > 0) {
          await this.prisma.shift.updateMany({
            where: {
              id: {
                in: updateToPending,
              },
            },
            data: {
              status: ShiftStatus.Pending,
            },
          });
        }
        if (updateToOngoing.length > 0) {
          await this.prisma.shift.updateMany({
            where: {
              id: {
                in: updateToOngoing,
              },
            },
            data: {
              status: ShiftStatus.Ongoing,
            },
          });
        }
        if (updateToCompleted.length > 0) {
          await this.prisma.shift.updateMany({
            where: {
              id: {
                in: updateToCompleted,
              },
            },
            data: {
              status: ShiftStatus.Completed,
            },
          });
        }

        const shifts = await this.prisma.shift.findMany({
          where: where,
          cursor: { id: res[res.length - 1].id },
          take: 100,
          skip: 1,
        });
        res = shifts;
      }

      await this.activityService.refreshActivitiesStatus(undefined);
    } finally {
      this.isRunning = false;
    }
  }
}

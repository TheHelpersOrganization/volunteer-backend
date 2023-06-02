import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftVolunteerStatus } from '../constants';

@Injectable()
export class ShiftVolunteerTaskService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  // Need to update volunteer status from "pending" to "rejected" if shift has started
  // Need to use cursor to get data slowly
  @Interval(60 * 60 * 1000)
  async updateShiftVolunteerStatus() {
    this.logCaller(undefined, this.updateShiftVolunteerStatus);
    // Query first 100 records
    let res = await this.prisma.volunteerShift.findMany({
      where: {
        status: ShiftVolunteerStatus.Pending,
      },
      take: 100,
    });
    // Then query next 100 records using cursor until no more records
    while (res.length > 0) {
      const shiftVolunteers = await this.prisma.volunteerShift.findMany({
        where: {
          status: ShiftVolunteerStatus.Pending,
          shift: {
            startTime: {
              gt: new Date(),
            },
          },
        },
        cursor: { id: res[res.length - 1].id },
        take: 100,
        skip: 1,
        include: {
          shift: true,
        },
      });
      res = shiftVolunteers;
      await this.prisma.volunteerShift.updateMany({
        where: {
          id: {
            in: shiftVolunteers.map((sv) => sv.id),
          },
        },
        data: {
          status: ShiftVolunteerStatus.Rejected,
        },
      });
    }
  }
}

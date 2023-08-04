import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class ShiftVolunteerTaskService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  // Need to update volunteer status from "pending" to "rejected" if shift has started
  // Need to use cursor to get data slowly
  // Need to use cron job to run this task every 3 minutes
  @Interval(3 * 60 * 1000)
  async updateShiftVolunteerStatus() {
    // this.logCaller(undefined, this.updateShiftVolunteerStatus);
    // // Query first 100 records
    // let res = await this.prisma.volunteerShift.findMany({
    //   where: {
    //     status: ShiftVolunteerStatus.Pending,
    //   },
    //   take: 100,
    // });
    // // Then query next 100 records using cursor until no more records
    // while (res.length > 0) {
    //   await this.prisma.volunteerShift.updateMany({
    //     where: {
    //       id: {
    //         in: res.map((sv) => sv.id),
    //       },
    //     },
    //     data: {
    //       status: ShiftVolunteerStatus.Rejected,
    //     },
    //   });
    //   const shiftVolunteers = await this.prisma.volunteerShift.findMany({
    //     where: {
    //       status: ShiftVolunteerStatus.Pending,
    //       shift: {
    //         status: ShiftStatus.Ongoing,
    //       },
    //     },
    //     cursor: { id: res[res.length - 1].id },
    //     take: 100,
    //     skip: 1,
    //     include: {
    //       shift: true,
    //     },
    //   });
    //   res = shiftVolunteers;
    // }
  }
}

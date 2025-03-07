import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { ProfileService } from '@app/profile/services';
import { Injectable } from '@nestjs/common';
import { shiftVolunteerStatuses } from '../constants';
import { GetShiftVolunteerQueryDto } from '../dtos';
import { ShiftVolunteerService } from './shift-volunteer.service';

@Injectable()
export class ModShiftVolunteerService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly shiftVolunteerService: ShiftVolunteerService,
  ) {
    super(logger);
  }

  async getShiftVolunteers(
    context: RequestContext,
    query: GetShiftVolunteerQueryDto,
  ) {
    this.logCaller(context, this.getShiftVolunteers);
    return this.shiftVolunteerService.getShiftVolunteers(context, query);
  }

  async countStatus(context: RequestContext, query: GetShiftVolunteerQueryDto) {
    this.logCaller(context, this.countStatus);
    const where = this.shiftVolunteerService.getShiftVolunteerFilter(
      query,
      context.account.id,
    );
    const count = await this.prisma.volunteerShift.groupBy({
      where: where,
      by: ['status'],
      _count: true,
    });
    const res = {
      total: count.reduce((acc, cur) => acc + cur._count, 0),
    };
    shiftVolunteerStatuses.forEach((status) => {
      res[status] = count.find((c) => c.status === status)?._count || 0;
    });
    return res;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ProfileService } from 'src/profile/services';
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

  getShiftVolunteerFilter(
    query: GetShiftVolunteerQueryDto,
  ): Prisma.VolunteerShiftWhereInput {
    const filter: Prisma.VolunteerShiftWhereInput = {};

    if (query.id) {
      filter.id = { in: query.id };
    }

    if (query.shiftId) {
      filter.shiftId = query.shiftId;
    }

    if (query.activityId) {
      filter.shift = { activityId: query.activityId };
    }

    if (query.status) {
      filter.status = { in: query.status };
    }

    return filter;
  }
}

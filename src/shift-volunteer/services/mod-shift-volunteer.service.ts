import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import {
  GetShiftVolunteerQueryDto,
  ShiftVolunteerInclude,
  ShiftVolunteerOutputDto,
} from '../dtos';

@Injectable()
export class ModShiftVolunteerService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getShiftVolunteers(
    context: RequestContext,
    query: GetShiftVolunteerQueryDto,
  ) {
    this.logCaller(context, this.getShiftVolunteers);
    const res = await this.prisma.volunteerShift.findMany({
      where: this.getShiftVolunteerFilter(query),
      take: query.limit,
      skip: query.offset,
    });
    const accountIds = res.map((v) => v.accountId);
    const profiles = await this.profileService.getProfiles(context, {
      ids: accountIds,
      select: getProfileBasicSelect,
    });
    if (query.include?.includes(ShiftVolunteerInclude.Profile) == true) {
      const extendedRes = res.map((v) => ({
        ...v,
        profile: profiles.find((p) => p.id === v.accountId),
      }));
      return this.outputArray(ShiftVolunteerOutputDto, extendedRes);
    }
    return this.outputArray(ShiftVolunteerOutputDto, res);
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

    if (query.status) {
      filter.status = { in: query.status };
    }

    return filter;
  }
}

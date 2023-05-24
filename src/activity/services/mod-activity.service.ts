import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ActivityOutputDto, ModGetActivitiesQueryDto } from '../dtos';
import {
  extendActivity,
  filterExtendedActivity,
  getActivityFilter,
} from '../utils';

@Injectable()
export class ModActivityService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getActivities(
    context: RequestContext,
    organizationId: number,
    query: ModGetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getActivities);

    const activityFilter = getActivityFilter(query);

    const activities = await this.prisma.activity.findMany({
      where: { ...activityFilter, organizationId: organizationId },
      include: {
        shifts: {
          include: {
            shiftLocations: {
              include: {
                location: true,
              },
            },
            shiftVolunteers: true,
            shiftContacts: {
              include: {
                contact: true,
              },
            },
            shiftSkills: true,
          },
        },
        activitySkills: true,
        activityManagers: true,
        activityContacts: {
          include: {
            contact: true,
          },
        },
      },
    });
    const extendedActivities = activities
      .map(extendActivity)
      .filter((a) => filterExtendedActivity(a, query));
    console.log(extendedActivities[0].contacts);
    return this.outputArray(ActivityOutputDto, extendedActivities);
  }
}

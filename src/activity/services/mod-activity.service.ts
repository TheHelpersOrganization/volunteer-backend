import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import {
  ActivityOutputDto,
  CreateActivityInputDto,
  ModGetActivitiesQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { RawActivity } from '../types';
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
    return this.outputArray(ActivityOutputDto, extendedActivities);
  }

  async createActivity(
    context: RequestContext,
    organizationId: number,
    dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.createActivity);

    const res = await this.prisma.activity.create({
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        organizationId: organizationId,
        activityManagers: dto.activityManagerIds && {
          createMany: {
            data: dto.activityManagerIds.map((id) => ({
              accountId: id,
            })),
          },
        },
      },
      include: {
        activityManagers: true,
      },
    });
    return this.mapToDto(res);
  }

  async updateActivity(
    context: RequestContext,
    organizationId: number,
    id: number,
    dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.updateActivity);

    const res = await this.prisma.activity.update({
      where: {
        id: id,
      },
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        activitySkills: {
          deleteMany: {},
          createMany: {
            data: dto.skillIds.map((id) => ({
              skillId: id,
            })),
          },
        },
        organizationId: dto.organizationId,
        activityManagers: {
          deleteMany: {},
          createMany: {
            data: dto.activityManagerIds.map((id) => ({
              accountId: id,
            })),
          },
        },
      },
      include: {
        activitySkills: true,
        activityManagers: true,
      },
    });

    return this.mapToDto(res);
  }

  async deleteActivity(
    context: RequestContext,
    id: number,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.deleteActivity);
    const res = await this.prisma.activity.delete({
      where: {
        id: id,
      },
      include: {
        activityManagers: true,
      },
    });
    return this.mapToDto(res);
  }

  private mapToDto(activity: RawActivity): ActivityOutputDto {
    console.log(activity.activityManagers);
    return this.output(ActivityOutputDto, {
      id: activity.id,
      name: activity.name,
      status: activity.status,
      description: activity.description,
      thumbnail: activity.thumbnail,
      skillIds: activity.skillIds,
      activityManagerIds: activity.activityManagers?.map(
        (activityManager) => activityManager.accountId,
      ),
      organizationId: activity.organizationId,
      startTime:
        activity.startTime ??
        (activity.shifts
          ? _.min(activity.shifts.map((s) => s.startTime))
          : undefined),
      endTime:
        activity.endTime ??
        (activity.shifts
          ? _.max(activity.shifts.map((s) => s.endTime))
          : undefined),
      location: activity.location,
      contacts: activity.contacts,
      maxParticipants: activity.maxParticipants,
      joinedParticipants: activity.joinedParticipants,
    });
  }
}

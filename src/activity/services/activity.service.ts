import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import {
  ActivityOutputDto,
  CreateActivityInputDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { RawActivity } from '../types';
import {
  extendActivity,
  filterExtendedActivity,
  getActivityFilter,
} from '../utils';

@Injectable()
export class ActivityService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getAll(
    context: RequestContext,
    query: GetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getAll);

    const res = await this.internalGet(context, query);
    const updated = res.map((activity) => this.mapToDto(activity));

    return this.outputArray(ActivityOutputDto, updated);
  }

  private async internalGet(
    context: RequestContext,
    query: GetActivitiesQueryDto,
  ) {
    this.logCaller(context, this.internalGet);

    const activityQuery = getActivityFilter(query);

    const res = await this.prisma.activity.findMany({
      where: activityQuery,
      take: query.limit,
      skip: query.offset,
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

    const extendedActivities = res
      .map(extendActivity)
      .filter((a) => filterExtendedActivity(a, query));

    return extendedActivities;
  }

  private async internalGetById(
    context: RequestContext,
    id: number,
    query: GetActivityByIdQueryDto,
  ) {
    this.logCaller(context, this.internalGetById);

    const activityQuery = getActivityFilter(query);

    const activity = await this.prisma.activity.findFirst({
      where: { ...activityQuery, id: id },
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

    if (activity == null) {
      return null;
    }

    return extendActivity(activity);
  }

  async getById(
    context: RequestContext,
    id: number,
    query: GetActivitiesQueryDto,
  ): Promise<ActivityOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.internalGetById(context, id, query);
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  async create(
    context: RequestContext,
    dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.create);

    const res = await this.prisma.activity.create({
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        activitySkills: {
          createMany: {
            data: dto.skillIds.map((id) => ({
              skillId: id,
            })),
          },
        },
        organizationId: dto.organizationId,
        activityManagers: {
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

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.update);

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

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.delete);
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

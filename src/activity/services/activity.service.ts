import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';
import { ShiftStatus } from 'src/shift/constants';
import { ActivityStatus } from '../constants';
import {
  ActivityOutputDto,
  CountActivityOutputDto,
  CountActivityQueryDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  MonthlyActivityCountOutputDto,
  UpdateActivityInputDto,
} from '../dtos';
import { RawActivity } from '../types';
import {
  extendActivity,
  filterExtendedActivity,
  getActivityFilter,
  getActivitySort,
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

    const accountId = context.account.id;
    const activityQuery = getActivityFilter(context, query, {
      joiner: context.account.id,
    });
    const sort = getActivitySort(query);

    const res = await this.prisma.activity.findMany({
      where: activityQuery,
      take: query.limit,
      skip: query.offset,
      cursor:
        query.cursor == null
          ? undefined
          : {
              id: query.cursor,
            },
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
            shiftManagers: true,
          },
        },
        activitySkills: true,
        activityManagers: true,
        activityContacts: {
          include: {
            contact: true,
          },
        },
        ActivityLocation: {
          include: {
            Location: true,
          },
        },
      },
      orderBy: sort,
    });
    const extendedActivities = res
      .map((v) => extendActivity(v, { contextAccountId: accountId }))
      .filter((a) => filterExtendedActivity(a, query));

    return extendedActivities;
  }

  private async internalGetById(
    context: RequestContext,
    id: number,
    query: GetActivityByIdQueryDto,
  ) {
    this.logCaller(context, this.internalGetById);

    const accountId = context.account.id;
    const activityQuery = getActivityFilter(context, query, {
      joiner: context.account.id,
    });

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
            shiftManagers: true,
          },
        },
        activitySkills: true,
        activityManagers: true,
        activityContacts: {
          include: {
            contact: true,
          },
        },
        ActivityLocation: {
          include: {
            Location: true,
          },
        },
      },
    });

    if (activity == null) {
      return null;
    }

    return extendActivity(activity, { contextAccountId: accountId });
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

  async updateActivity(
    context: RequestContext,
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
        activityContacts:
          dto.contacts === undefined
            ? undefined
            : {
                deleteMany: {},
                create: dto.contacts?.map((d) => ({
                  contact: {
                    create: d,
                  },
                })),
              },
        activitySkills:
          dto.skillIds === undefined
            ? undefined
            : {
                deleteMany: {},
                createMany: {
                  data: dto.skillIds.map((id) => ({
                    skillId: id,
                  })),
                },
              },
        activityManagers:
          dto.activityManagerIds === undefined
            ? undefined
            : {
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
        activityContacts: {
          include: {
            contact: true,
          },
        },
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
    });
    return this.mapToDto(res);
  }

  async refreshActivitiesStatus(context?: RequestContext) {
    this.logCaller(context, this.refreshActivitiesStatus);
    const where: Prisma.ActivityWhereInput = {
      OR: [
        {
          status: ActivityStatus.Pending,
          shifts: {
            some: {
              status: {
                not: ShiftStatus.Pending,
              },
            },
          },
        },
        {
          status: ActivityStatus.Ongoing,
          shifts: {
            none: {
              status: ShiftStatus.Ongoing,
            },
          },
        },
        {
          status: ActivityStatus.Completed,
          shifts: {
            some: {
              status: {
                not: ShiftStatus.Completed,
              },
            },
          },
        },
      ],
    };
    // Query first 100 records
    let res = await this.prisma.activity.findMany({
      where: where,
      take: 100,
      select: {
        id: true,
        status: true,
        shifts: {
          select: {
            status: true,
          },
        },
      },
    });
    // Then query next 100 records using cursor until no more records
    while (res.length > 0) {
      const activities = await this.prisma.activity.findMany({
        where: where,
        cursor: { id: res[res.length - 1].id },
        take: 100,
        skip: 1,
        select: {
          id: true,
          status: true,
          shifts: {
            select: {
              status: true,
            },
          },
        },
      });
      const updateToPending: number[] = [];
      const updateToOngoing: number[] = [];
      const updateToCompleted: number[] = [];
      activities.forEach((activity) => {
        if (
          activity.shifts.every((shift) => shift.status === ShiftStatus.Pending)
        ) {
          updateToPending.push(activity.id);
        } else if (
          activity.shifts.every(
            (shift) => shift.status === ShiftStatus.Completed,
          )
        ) {
          updateToCompleted.push(activity.id);
        } else {
          // Catch other cases
          updateToOngoing.push(activity.id);
        }
      });
      await this.prisma.activity.updateMany({
        where: {
          id: { in: updateToPending },
        },
        data: {
          status: ActivityStatus.Pending,
        },
      });
      await this.prisma.activity.updateMany({
        where: {
          id: { in: updateToOngoing },
        },
        data: {
          status: ActivityStatus.Ongoing,
        },
      });
      await this.prisma.activity.updateMany({
        where: {
          id: { in: updateToCompleted },
        },
        data: {
          status: ActivityStatus.Completed,
        },
      });

      res = activities;
    }
  }

  async suggestActivities(context: RequestContext) {
    this.logCaller(context, this.suggestActivities);

    /* Activity suggestion algorithm
    1. Get all activities with status pending and user has not signed up for
    2. Get activities that is near the user
    3. Get activities that is in the user's skill set
    4. Get activities that is in the user's interest
    5. Get activities that is in the user's preferred time
    */

    const activities = await this.prisma.activity.findMany({
      where: {
        status: ActivityStatus.Pending,
        shifts: {
          some: {
            shiftVolunteers: {
              none: {
                accountId: context.account.id,
              },
            },
          },
        },
      },
    });
  }

  async countActivities(context: RequestContext, query: CountActivityQueryDto) {
    this.logCaller(context, this.countActivities);
    // The first activity created is the oldest activity
    const first = await this.prisma.activity.findFirst({
      where: {
        startTime: {
          not: null,
          gte: query.startTime,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    if (first == null) {
      return this.output(CountActivityOutputDto, {
        total: 0,
        monthly: [],
      });
    }
    const firstMonth = dayjs(first.startTime).month() + 1;
    const firstYear = dayjs(first.startTime).year();
    // The last activity created is the latest activity
    const last = await this.prisma.activity.findFirst({
      where: {
        startTime: {
          not: null,
          lte: query.endTime,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    if (last == null) {
      return this.output(CountActivityOutputDto, {
        total: 0,
        monthly: [],
      });
    }
    const lastMonth = dayjs(last.startTime).month() + 1;
    const lastYear = dayjs(last.startTime).year();

    const total = await this.prisma.activity.count();
    const monthly: MonthlyActivityCountOutputDto[] = [];
    for (let year = firstYear; year <= lastYear; year++) {
      const startMonth = year === firstYear ? firstMonth : 1;
      const endMonth = year === lastYear ? lastMonth : 12;
      for (let month = startMonth; month <= endMonth; month++) {
        const count = await this.prisma.activity.count({
          where: {
            startTime: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        });
        monthly.push({
          year: year,
          month: month,
          count: count,
        });
      }
    }

    return this.output(CountActivityOutputDto, {
      total: total,
      monthly: monthly,
    });
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
      startTime: activity.startTime,
      endTime: activity.endTime,
      organizationId: activity.organizationId,
      location: activity.location,
      contacts: activity.contacts,
      maxParticipants: activity.maxParticipants,
      joinedParticipants: activity.joinedParticipants,
      me: {
        isManager: activity.isManager,
        isShiftManager: activity.isShiftManager,
        shiftManagerCount: activity.shiftManagerCount,
      },
    });
  }
}

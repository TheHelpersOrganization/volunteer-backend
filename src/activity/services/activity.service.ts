import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as geolib from 'geolib';
import { LocationOutputDto } from 'src/location/dtos';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftStatus } from 'src/shift/constants';
import { ActivityStatus } from '../constants';
import {
  ActivityOutputDto,
  ActivityQueryOutputDto,
  BaseGetActivityQueryDto,
  CountActivityOutputDto,
  CountActivityQueryDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  MonthlyActivityCountOutputDto,
  UpdateActivityInputDto,
} from '../dtos';
import { ExtendedActivityInput, RawActivity } from '../types';
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
    options?: {
      recordHistory?: boolean;
    },
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getAll);

    const res = await this.internalGet(context, query, {
      recordHistory: options?.recordHistory ?? true,
    });
    const updated = res.map((activity) => this.mapToDto(activity));

    return this.outputArray(ActivityOutputDto, updated);
  }

  private async internalGet(
    context: RequestContext,
    query: GetActivitiesQueryDto,
    options?: {
      recordHistory?: boolean;
    },
  ) {
    this.logCaller(context, this.internalGet);

    const accountId = context.account.id;
    const activityQuery = getActivityFilter(context, query, {
      joiner: context.account.id,
    });
    const sort = getActivitySort(query);
    const extendedActivities: ExtendedActivityInput[] = [];

    // Naive implementation of backend-filtered pagination

    const realLimit = query.limit ?? 100;
    let notFoundIteration = 0;
    let cursor = query.cursor;
    let searchLimit = realLimit;
    if (query.availableSlots || query.radius) {
      searchLimit = 1000;
    }

    // Prevent spamming of search history
    // Check if previous history is within 30 seconds
    if (options?.recordHistory) {
      const previousHistory = await this.prisma.activitySearchHistory.findFirst(
        {
          where: {
            accountId: accountId,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      );
      if (
        previousHistory != null &&
        dayjs(dayjs()).diff(previousHistory.createdAt, 'second') < 30
      ) {
        await this.prisma.activitySearchHistory.update({
          where: {
            id: previousHistory.id,
          },
          data: {
            query: query as Prisma.InputJsonObject,
          },
        });
      } else {
        await this.prisma.activitySearchHistory.create({
          data: {
            accountId: accountId,
            query: query as Prisma.InputJsonObject,
          },
        });
      }
    }

    while (extendedActivities.length < realLimit && notFoundIteration <= 3) {
      const res: ExtendedActivityInput[] = await this.prisma.activity.findMany({
        where: activityQuery,
        take: searchLimit,
        skip: cursor != null ? 1 : query.offset,
        cursor:
          cursor == null
            ? undefined
            : {
                id: cursor,
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

      if (res.length === 0) {
        break;
      }

      const found = res
        .map((v) => extendActivity(v, { contextAccountId: accountId }))
        .filter((a) => filterExtendedActivity(a, query));

      if (found.length === 0) {
        notFoundIteration++;
      }

      extendedActivities.push(...found);
      cursor = res[res.length - 1]?.id;
    }

    return extendedActivities.slice(0, realLimit);
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

  async getSearchHistory(context: RequestContext) {
    this.logCaller(context, this.getSearchHistory);

    const histories = await this.prisma.activitySearchHistory.findMany({
      where: {
        accountId: context.account.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const res = histories.map((v) =>
      this.output(ActivityQueryOutputDto, {
        ...v,
        ...(v.query as Prisma.JsonObject),
      }),
    );

    return res;
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

  async suggestActivities(
    context: RequestContext,
    query: BaseGetActivityQueryDto,
  ) {
    this.logCaller(context, this.suggestActivities);

    /* Activity suggestion algorithm
    1. Get all activities with status pending and user has not signed up for
    2. Get activities that is near the user
    3. Get activities that is in the user's skill set
    4. Get activities that is in the user's interest
    5. Get activities that is in the user's preferred time
    6. Activity terms
    7. Search terms
    8. Sort by distance
    */

    const readLimit = query.limit ?? 100;

    const skillWeight: { [key: number]: number } = {};

    const previousInterestedShifts = await this.prisma.shift.findMany({
      where: {
        status: {
          in: [ShiftStatus.Ongoing, ShiftStatus.Completed],
        },
        shiftVolunteers: {
          some: {
            accountId: context.account.id,
            active: true,
            status: {
              in: [
                ShiftVolunteerStatus.Approved,
                ShiftVolunteerStatus.Rejected,
                ShiftVolunteerStatus.Removed,
              ],
            },
          },
        },
      },
      include: {
        shiftSkills: true,
        shiftLocations: {
          include: {
            location: true,
          },
        },
      },
    });
    previousInterestedShifts.forEach((shift) => {
      shift.shiftSkills.forEach((shiftSkill) => {
        if (skillWeight[shiftSkill.skillId] == null) {
          skillWeight[shiftSkill.skillId] = 0;
        }
        const timeDiff = dayjs(dayjs()).diff(shift.startTime, 'day');
        // More recent activity has more weight
        // 100 days ago: 1 weight
        // 1 day ago: 100 weight
        let weight = 100 / Math.pow(timeDiff + 1, 2);
        weight = Math.min(weight, 100);
        weight = Math.max(weight, 1);
        skillWeight[shiftSkill.skillId] += weight;
      });
    });

    // Recent activity weight more

    // Interest skills: 100

    const interestedSkills = await this.prisma.profileInterestedSkill.findMany({
      where: {
        profileId: context.account.id,
      },
    });
    interestedSkills.forEach((interestedSkill) => {
      if (skillWeight[interestedSkill.skillId] == null) {
        skillWeight[interestedSkill.skillId] = 0;
      }
      skillWeight[interestedSkill.skillId] += 100;
    });

    const searchHistories = await this.prisma.activitySearchHistory.findMany({
      where: {
        accountId: context.account.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
    });
    searchHistories.forEach((searchHistory) => {
      const query = searchHistory.query as GetActivitiesQueryDto;
      if (query.skill != null) {
        query.skill.forEach((skillId) => {
          if (skillWeight[skillId] == null) {
            skillWeight[skillId] = 0;
          }

          const timeDiff = dayjs(dayjs()).diff(searchHistory.updatedAt, 'day');
          // More recent activity has more weight
          // 100 days ago: 1 weight
          // 1 day ago: 100 weight
          let weight = 100 / Math.pow(timeDiff + 1, 2);
          weight = Math.min(weight, 100);
          skillWeight[skillId] += weight;
        });
      }
    });

    const startTimeWeight: { [key: number]: number } = {};
    const workDurationWeight: { [key: number]: number } = {};

    previousInterestedShifts.forEach((shift) => {
      const timeDiff = dayjs(dayjs()).diff(shift.startTime, 'day');
      // More recent activity has more weight
      let weight = 100 / Math.pow(timeDiff + 1, 2);
      weight = Math.min(weight, 100);
      weight = Math.max(weight, 1);
      startTimeWeight[shift.startTime.getHours()] = weight;

      // 30 minutes count as 1 hour and so on
      const hours = dayjs(shift.endTime).diff(shift.startTime, 'hour') + 1;
      workDurationWeight[hours] = weight;
    });

    const locationWeight: { location: LocationOutputDto; weight: number }[] =
      [];
    previousInterestedShifts.forEach((shift) => {
      shift.shiftLocations.forEach((shiftLocation) => {
        const location = shiftLocation.location;
        const timeDiff = dayjs(dayjs()).diff(shift.startTime, 'day');
        // More recent activity has more weight
        let weight = 200 / (timeDiff + 1);
        weight = Math.min(weight, 200);
        weight = Math.max(weight, 1);
        locationWeight.push({
          location: location,
          weight: weight,
        });
      });
    });

    // console.log(skillWeight);
    // console.log(startTimeWeight);
    // console.log(workDurationWeight);
    // console.log(
    //   locationWeight
    //     .sort((v, v2) => v2.weight - v.weight)
    //     .map((v) => `${v.location.locality},${v.location.region} ${v.weight}`),
    // );

    const activities = await this.prisma.activity.findMany({
      where: {
        id: {
          notIn: previousInterestedShifts.map((activity) => activity.id),
        },
        shifts: {
          some: {
            status: ShiftStatus.Pending,
            shiftVolunteers: {
              none: {
                accountId: context.account.id,
              },
            },
          },
        },
      },
      include: {
        shifts: {
          where: {
            status: ShiftStatus.Pending,
            shiftVolunteers: {
              none: {
                accountId: context.account.id,
              },
            },
          },
          include: {
            shiftSkills: true,
            shiftLocations: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    const weightedActivities = activities
      .map((activity) => {
        let weight = 0;
        activity.shifts.forEach((shift) => {
          shift.shiftSkills.forEach((shiftSkill) => {
            if (skillWeight[shiftSkill.skillId] != null) {
              weight += skillWeight[shiftSkill.skillId];
            }
          });
          if (startTimeWeight[shift.startTime.getUTCHours()] != null) {
            weight += startTimeWeight[shift.startTime.getUTCHours()];
          }
          const hours = dayjs(shift.endTime).diff(shift.startTime, 'hour') + 1;
          if (workDurationWeight[hours] != null) {
            weight += workDurationWeight[hours];
          }
          shift.shiftLocations.forEach((shiftLocation) => {
            const location = shiftLocation.location;
            const lat1 = location.latitude;
            const lng1 = location.longitude;
            if (lat1 == null || lng1 == null) {
              return;
            }
            locationWeight.forEach((locationWeight) => {
              const lat2 = locationWeight.location.latitude;
              const lng2 = locationWeight.location.longitude;
              if (lat2 == null || lng2 == null) {
                return;
              }
              // 10km traveling is acceptable
              const dist =
                geolib.getDistance(
                  { lat: lat2, lng: lng2 },
                  { lat: lat1, lng: lng1 },
                  1000,
                ) * 0.1;
              weight += locationWeight.weight / (dist + 1);
            });
          });
        });
        return {
          activity: activity,
          weight: weight,
        };
      })
      .sort((a, b) => b.weight - a.weight);

    const ids = weightedActivities
      .slice(0, readLimit)
      .map((v) => v.activity.id);

    return this.getAll(
      context,
      {
        ids: ids,
        limit: query.limit,
        cursor: query.cursor,
      },
      {
        recordHistory: false,
      },
    );
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

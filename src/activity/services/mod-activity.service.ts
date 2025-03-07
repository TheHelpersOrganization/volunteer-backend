import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { createNewActivityNotification } from '@app/notification/constants/notifications';
import { NotificationService } from '@app/notification/services';
import {
  OrganizationMemberStatus,
  OrganizationStatus,
} from '@app/organization/constants';
import { OrganizationNotFoundException } from '@app/organization/exceptions';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
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
  getActivitySort,
} from '../utils';

@Injectable()
export class ModActivityService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    super(logger);
  }

  async getActivities(
    context: RequestContext,
    organizationId: number,
    query: ModGetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getActivities);

    const activityFilter = getActivityFilter(context, query);

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
      orderBy: getActivitySort(query),
    });
    const extendedActivities = activities
      .map((v) => extendActivity(v, { contextAccountId: context.account.id }))
      .filter((a) => filterExtendedActivity(a, query));
    const mapped = extendedActivities.map((a) => this.mapToDto(a));
    return this.outputArray(ActivityOutputDto, mapped);
  }

  async createActivity(
    context: RequestContext,
    organizationId: number,
    dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.createActivity);

    // TODO: check if user owns organization
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
        status: OrganizationStatus.Verified,
        isDisabled: false,
      },
      include: {
        members: {
          where: {
            status: OrganizationMemberStatus.Approved,
          },
        },
      },
    });

    if (!organization) {
      throw new OrganizationNotFoundException();
    }

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
        activityContacts: dto.contacts && {
          createMany: {
            data: dto.contacts.map((id) => ({
              contactId: id,
            })),
          },
        },
        ActivityLocation: {
          create: {
            Location: { create: dto.location },
          },
        },
      },
      include: {
        activityManagers: true,
        ActivityLocation: {
          include: {
            Location: true,
          },
        },
      },
    });

    const createNotification = createNewActivityNotification({
      activityName: res.name,
      organizationName: organization.name!,
    });
    this.notificationService.sendNotifications(context, {
      ...createNotification,
      accountIds: organization.members.map((m) => m.accountId),
      activityId: res.id,
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
        ActivityLocation:
          dto.location === undefined
            ? undefined
            : {
                deleteMany: {},
                create: {
                  Location: {
                    create: dto.location,
                  },
                },
              },
      },
      include: {
        activitySkills: true,
        activityManagers: true,
        ActivityLocation: {
          include: {
            Location: true,
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
      include: {
        activityManagers: true,
        ActivityLocation: {
          include: {
            Location: true,
          },
        },
      },
    });
    return this.mapToDto(res);
  }

  private mapToDto(activity: RawActivity): ActivityOutputDto {
    return this.output(ActivityOutputDto, {
      id: activity.id,
      name: activity.name,
      isDisabled: activity.isDisabled,
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
      rating: activity.rating,
      ratingCount: activity.ratingCount,
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

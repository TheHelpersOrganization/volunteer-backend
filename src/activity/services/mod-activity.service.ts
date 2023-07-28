import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { NotificationType } from 'src/notification/constants';
import { NotificationService } from 'src/notification/services';
import {
  OrganizationMemberStatus,
  OrganizationStatus,
} from 'src/organization/constants';
import { OrganizationNotFoundException } from 'src/organization/exceptions';
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
        activityContacts: {
          create:
            dto.contacts &&
            dto.contacts.map((contact) => ({
              contact: {
                create: {
                  name: contact.name,
                  email: contact.email,
                  phone: contact.phoneNumber,
                },
              },
            })),
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

    this.notificationService.sendNotifications(context, {
      type: NotificationType.Activity,
      title: 'New Activity',
      shortDescription: `New activity ${res.name} has been created for ${organization.name}.`,
      description: `New activity ${res.name} has been created for ${organization.name}.`,
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

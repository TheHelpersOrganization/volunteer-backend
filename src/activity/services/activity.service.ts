import { Injectable } from '@nestjs/common';
import {
  Activity,
  ActivityManager,
  ActivitySkill,
  Contact,
  Location,
  Prisma,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftSkill,
} from '@prisma/client';
import * as _ from 'lodash';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { unionLocationsTransform } from 'src/common/transformers';
import { PrismaService } from 'src/prisma';
import { ShiftVolunteerStatus } from 'src/shift/constants';

import { ContactOutputDto } from 'src/contact/dtos';
import {
  ActivityOutputDto,
  ActivityQueryDto,
  CreateActivityInputDto,
  UpdateActivityInputDto,
} from '../dtos';

@Injectable()
export class ActivityService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getAll(
    context: RequestContext,
    query: ActivityQueryDto,
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getAll);

    const res = await this.internalGet(context, query);
    const updated = res.map((activity) => this.mapToDto(activity));

    return this.outputArray(ActivityOutputDto, updated);
  }

  private async internalGet(context: RequestContext, query: ActivityQueryDto) {
    this.logCaller(context, this.internalGet);

    const activityQuery = this.getActivityFilter(query);

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
      },
    });

    const withParticipants = res.map((activity) => {
      let maxParticipants: number | null = 0;
      let joinedParticipants = 0;

      for (const shift of activity.shifts) {
        if (maxParticipants != null) {
          if (shift.numberOfParticipants == null) {
            maxParticipants = null;
          } else {
            maxParticipants += shift.numberOfParticipants;
          }
        }
        for (const shiftVolunteer of shift.shiftVolunteers) {
          if (
            shiftVolunteer.status == ShiftVolunteerStatus.Approved ||
            shiftVolunteer.status == ShiftVolunteerStatus.Pending
          ) {
            joinedParticipants++;
          }
        }
      }

      return { ...activity, maxParticipants, joinedParticipants };
    });

    const filtered = withParticipants.filter((activity) => {
      const availableSlots =
        activity.maxParticipants == null || activity.maxParticipants == 0
          ? null
          : activity.maxParticipants - activity.joinedParticipants;
      if (availableSlots == null) {
        return true;
      }
      if (query.av == null) {
        return true;
      }
      return availableSlots >= query.av;
    });

    return filtered;
  }

  private async internalGetById(context: RequestContext, id: number) {
    this.logCaller(context, this.internalGetById);

    const activity = await this.prisma.activity.findUnique({
      where: {
        id: id,
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
          },
        },
        activitySkills: true,
        activityManagers: true,
      },
    });

    if (activity == null) {
      return null;
    }

    let maxParticipants: number | null = 0;
    let joinedParticipants = 0;

    for (const shift of activity.shifts) {
      if (maxParticipants != null) {
        if (shift.numberOfParticipants == null) {
          maxParticipants = null;
        } else {
          maxParticipants += shift.numberOfParticipants;
        }
      }
      for (const shiftVolunteer of shift.shiftVolunteers) {
        if (
          shiftVolunteer.status == ShiftVolunteerStatus.Approved ||
          shiftVolunteer.status == ShiftVolunteerStatus.Pending
        ) {
          joinedParticipants++;
        }
      }
    }

    return {
      ...activity,
      joinedParticipants,
      maxParticipants,
    };
  }

  private getActivityFilter(query: ActivityQueryDto) {
    let activityQuery: Prisma.ActivityWhereInput | undefined = undefined;
    if (query.n) {
      activityQuery = {
        name: {
          contains: query.n.trim(),
          mode: 'insensitive',
        },
      };
    }
    if (query.org) {
      activityQuery = {
        ...activityQuery,
        organizationId: {
          in: query.org,
        },
      };
    }
    if (query.as) {
      activityQuery = {
        ...activityQuery,
        activitySkills: {
          some: {
            skillId: {
              in: query.as,
            },
          },
        },
      };
    }
    const shiftQuery = this.getShiftFilter(query);
    if (shiftQuery) {
      activityQuery = {
        ...activityQuery,
        shifts: shiftQuery,
      };
    }
    return activityQuery;
  }

  private getShiftFilter(query: ActivityQueryDto) {
    let shiftQuery: Prisma.ShiftListRelationFilter | undefined = undefined;
    shiftQuery = {
      some: {},
    };
    if (query.st) {
      shiftQuery = {
        some: {
          startTime: query.st && {
            gte: query.st,
          },
        },
      };
    }
    if (query.et) {
      shiftQuery = {
        ...shiftQuery,
        some: {
          endTime: {
            lte: query.et,
          },
        },
      };
    }
    if (query.sk) {
      shiftQuery = {
        ...shiftQuery,
        some: {
          shiftSkills: {
            some: {
              skillId: {
                in: query.sk,
              },
            },
          },
        },
      };
    }
    if (query.lc || query.rg || query.ct) {
      shiftQuery = {
        ...shiftQuery,
        some: {
          shiftLocations: {
            some: {
              location: {
                locality: {
                  contains: query.lc?.trim(),
                  mode: 'insensitive',
                },
                region: {
                  contains: query.rg?.trim(),
                  mode: 'insensitive',
                },
                country: query.ct,
              },
            },
          },
        },
      };
    }
    return shiftQuery;
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<ActivityOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.internalGetById(context, id);
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

  mapToDto(
    activity: Activity & {
      activitySkills?: ActivitySkill[];
      activityManagers?: ActivityManager[];
      shifts?: (Shift & {
        shiftLocations: (ShiftLocation & {
          location: Location;
        })[];
        shiftSkills?: ShiftSkill[];
        shiftContacts?: (ShiftContact & { contact: Contact })[];
      })[];
      maxParticipants?: number | null;
      joinedParticipants?: number;
    },
  ): ActivityOutputDto {
    const locations = activity.shifts?.flatMap((s) =>
      s.shiftLocations.map((sl) => sl.location),
    );
    const unionLocation = locations
      ? unionLocationsTransform(locations)
      : undefined;

    const skillIds = activity.shifts?.flatMap((shift) =>
      shift.shiftSkills?.map((sk) => sk.skillId),
    );
    const filteredSkillIds: number[] = [];
    skillIds?.forEach((skillId) => {
      if (skillId == null) {
        return;
      }
      if (filteredSkillIds.includes(skillId)) {
        return;
      }
      filteredSkillIds.push(skillId);
    });

    return this.output(ActivityOutputDto, {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      thumbnail: activity.thumbnail,
      skillIds: filteredSkillIds,
      activityManagerIds: activity.activityManagers?.map(
        (activityManager) => activityManager.accountId,
      ),
      organizationId: activity.organizationId,
      startTime: activity.shifts
        ? _.min(activity.shifts.map((s) => s.startTime))
        : undefined,
      endTime: activity.shifts
        ? _.max(activity.shifts.map((s) => s.endTime))
        : undefined,
      location: unionLocation,
      contacts: this.outputArray(
        ContactOutputDto,
        activity.shifts?.flatMap((s) =>
          s.shiftContacts?.map((sc) => sc.contact),
        ) ?? [],
      ),
      maxParticipants: activity.maxParticipants,
      joinedParticipants: activity.joinedParticipants,
    });
  }
}

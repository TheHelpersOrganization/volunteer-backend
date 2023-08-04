import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { ContactService } from '@app/contact/services';
import { LocationService } from '@app/location/services';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma, VolunteerShift } from '@prisma/client';

import { ActivityNotFoundException } from '@app/activity/exceptions';
import { getProfileBasicSelect } from '@app/profile/dtos';
import { ProfileService } from '@app/profile/services';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { ShiftVolunteerService } from '@app/shift-volunteer/services';
import { max, min } from 'lodash';
import { ShiftStatus } from '../constants';
import {
  CreateShiftInputDto,
  GetShiftInclude,
  GetShiftQueryDto,
  GetShiftSort,
  GetShiftsQueryDto,
  ShiftOutputDto,
  UpdateShiftInputDto,
} from '../dtos';
import { ShiftNotFoundException } from '../exceptions';

@Injectable()
export class ShiftService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
    private readonly profileService: ProfileService,
    private readonly shiftVolunteerService: ShiftVolunteerService,
  ) {
    super(logger);
  }

  async getByActivityId(
    context: RequestContext,
    activityId: number,
  ): Promise<ShiftOutputDto[]> {
    this.logCaller(context, this.getByActivityId);
    const res = await this.prisma.shift.findMany({
      where: {
        activityId: activityId,
      },
      include: {
        shiftLocations: {
          include: {
            location: true,
          },
        },
        shiftContacts: {
          include: {
            contact: true,
          },
        },
        shiftSkills: {
          include: {
            skill: true,
          },
        },
        shiftVolunteers: true,
        shiftManagers: true,
      },
    });
    const updated = res.map((shift) => this.mapToOutput(context, shift));
    return this.outputArray(ShiftOutputDto, updated);
  }

  async getShifts(context: RequestContext, query: GetShiftsQueryDto) {
    this.logCaller(context, this.getShifts);
    const where = await this.getShiftFilter(query, {
      contextAccountId: context.account.id,
    });
    const res: any[] = await this.prisma.shift.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
      include: this.getShiftInclude(context, query),
      orderBy: this.getShiftSort(query),
    });
    if (query.include?.includes(GetShiftInclude.ShiftVolunteerProfile)) {
      const set = new Set<number>();
      res.forEach((shift) => {
        shift.shiftVolunteers.forEach((v) => set.add(v.accountId));
      });
      const profiles = await this.profileService.getProfiles(context, {
        ids: Array.from(set),
        select: getProfileBasicSelect,
      });
      res.forEach((shift) => {
        shift.shiftVolunteers.forEach((v) => {
          v.profile = profiles.find((p) => p.id === v.accountId);
        });
      });
    }

    return res.map((r) => this.mapToOutput(context, r));
  }

  async getShiftById(
    context: RequestContext,
    id: number,
    query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.getShiftById);
    const res = await this.prisma.shift.findUnique({
      where: {
        id: id,
      },
      include: this.getShiftInclude(context, query),
    });
    if (res == null) {
      return null;
    }
    return this.mapToOutput(context, res);
  }

  async createShift(
    context: RequestContext,
    dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.createShift);
    return this.prisma.$transaction(
      async (tx) => {
        const activity = await tx.activity.findUnique({
          where: {
            id: dto.activityId,
          },
        });
        if (activity == null) {
          throw new ActivityNotFoundException();
        }
        const locationIds = dto.locations
          ? (await this.locationService.createMany(context, dto.locations)).map(
              (l) => ({
                locationId: l.id,
              }),
            )
          : undefined;
        const contactIds = dto.contacts?.map((c) => ({
          contactId: c,
        }));

        const res = await this.prisma.shift.create({
          data: {
            activityId: dto.activityId,
            name: dto.name,
            description: dto.description,
            numberOfParticipants: dto.numberOfParticipants,
            availableSlots: dto.numberOfParticipants,
            startTime: dto.startTime,
            endTime: dto.endTime,
            status:
              dto.endTime < new Date() ? ShiftStatus.Completed : undefined,
            shiftLocations: {
              createMany: {
                data: locationIds ?? [],
              },
            },
            shiftContacts: {
              createMany: {
                data: contactIds ?? [],
              },
            },
            shiftSkills: {
              createMany: {
                data: dto.shiftSkills ?? [],
              },
            },
            shiftManagers: {
              createMany: {
                data: dto.shiftManagers ?? [],
              },
            },
          },
          include: this.getShiftInclude(context, {}),
        });
        const startTime =
          activity.startTime == null
            ? dto.startTime
            : min([activity.startTime, dto.startTime]);
        const endTime =
          activity.endTime == null
            ? dto.endTime
            : max([activity.endTime, dto.endTime]);
        await tx.activity.update({
          where: {
            id: dto.activityId,
          },
          data: {
            startTime: startTime,
            endTime: endTime,
          },
        });
        return this.mapToOutput(context, res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async updateShift(
    context: RequestContext,
    id: number,
    dto: UpdateShiftInputDto,
    query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.updateShift);
    const shift = await this.prisma.shift.findUnique({
      where: {
        id: id,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    return this.prisma.$transaction(
      async (tx) => {
        const include = this.getShiftInclude(context, query);

        const numberOfParticipants = dto.numberOfParticipants;
        let availableSlots: number | null | undefined = undefined;

        if (dto.numberOfParticipants != shift.numberOfParticipants) {
          const volunteersCount = await tx.volunteerShift.count({
            where: {
              shiftId: id,
              status: ShiftVolunteerStatus.Approved,
            },
          });
          availableSlots =
            dto.numberOfParticipants == null
              ? null
              : max([0, dto.numberOfParticipants - volunteersCount]);
        }

        const res = await tx.shift.update({
          where: {
            id: id,
          },
          data: {
            name: dto.name,
            description: dto.description,
            startTime: dto.startTime,
            endTime: dto.endTime,
            availableSlots: availableSlots,
            numberOfParticipants: numberOfParticipants,
            shiftLocations:
              dto.locations === undefined
                ? undefined
                : {
                    deleteMany: {},
                    create: dto.locations?.map((d) => ({
                      location: {
                        create: d,
                      },
                    })),
                  },
            shiftContacts:
              dto.contacts === undefined
                ? undefined
                : {
                    deleteMany: {},
                    createMany: {
                      data: dto.contacts?.map((d) => ({
                        contactId: d,
                      })),
                    },
                  },
            shiftSkills:
              dto.shiftSkills === undefined
                ? undefined
                : {
                    deleteMany: {},
                    create: dto.shiftSkills,
                  },
            shiftManagers:
              dto.shiftManagers === undefined
                ? undefined
                : {
                    deleteMany: {},
                    create: dto.shiftManagers,
                  },
          },
          include: include,
        });

        const activity = await tx.activity.findUnique({
          where: {
            id: res.activityId,
          },
        });
        if (activity == null) {
          throw new ActivityNotFoundException();
        }
        const startTime =
          activity.startTime == null
            ? res.startTime
            : min([activity.startTime, res.startTime]);

        const endTime =
          activity.endTime == null
            ? res.endTime
            : max([activity.endTime, res.endTime]);
        await tx.activity.update({
          where: {
            id: res.activityId,
          },
          data: {
            startTime: startTime,
            endTime: endTime,
          },
        });

        return this.mapToOutput(context, res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async deleteShift(
    context: RequestContext,
    id: number,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.deleteShift);
    const include = this.getShiftInclude(context, {});

    const res = await this.prisma.$transaction(async (tx) => {
      const res = await this.prisma.shift.delete({
        where: {
          id: id,
        },
        include: include,
      });
      const shifts = await tx.shift.findMany({
        where: {
          activityId: res.activityId,
        },
      });
      const startTime = min(shifts.map((d) => d.startTime)) ?? null;
      const endTime = max(shifts.map((d) => d.endTime)) ?? null;
      await tx.activity.update({
        where: {
          id: res.activityId,
        },
        data: {
          startTime: startTime,
          endTime: endTime,
        },
      });
      return res;
    });

    return this.mapToOutput(context, res);
  }

  async getShiftFilter(
    query: GetShiftsQueryDto,
    extra?: { contextAccountId?: number },
  ) {
    const filter: Prisma.ShiftWhereInput = {};
    if (query.id) {
      filter.id = {
        in: query.id,
      };
    }
    if (query.activityId) {
      filter.activityId = {
        in: query.activityId,
      };
    }
    if (query.org) {
      filter.activity = {
        organizationId: {
          in: query.org,
        },
      };
    }
    if (query.name) {
      filter.name = {
        contains: query.name.trim(),
        mode: 'insensitive',
      };
    }
    if (query.startTime) {
      filter.startTime = {
        gte: query.startTime[0],
        lte: query.startTime[1],
      };
    }
    if (query.endTime) {
      filter.endTime = {
        gte: query.endTime[0],
        lte: query.endTime[1],
      };
    }

    if (query.numberOfParticipants) {
      filter.OR = [
        {
          numberOfParticipants: null,
        },
        {
          numberOfParticipants: {
            gte: query.numberOfParticipants[0],
            lte: query.numberOfParticipants[1],
          },
        },
      ];
    }

    if (query.myJoinStatus && extra?.contextAccountId) {
      filter.shiftVolunteers = {
        some: {
          accountId: extra.contextAccountId,
          status: {
            in: query.myJoinStatus,
          },
          active: true,
        },
      };
    }
    if (query.status) {
      filter.status = {
        in: query.status,
      };
    }
    if (query.availableSlots) {
      filter.availableSlots = {
        gte: query.availableSlots[0],
        lte: query.availableSlots[1],
      };
    }
    if (query.isShiftManager && extra?.contextAccountId) {
      filter.shiftManagers = {
        some: {
          accountId: extra.contextAccountId,
        },
      };
    }

    return filter;
  }

  getShiftInclude(context: RequestContext, query: GetShiftsQueryDto) {
    const include: Prisma.ShiftInclude = {
      shiftLocations: {
        include: {
          location: true,
        },
      },
      shiftContacts: {
        include: {
          contact: true,
        },
      },
      shiftManagers: true,
      _count: {
        select: {
          shiftVolunteers: {
            where: {
              status: ShiftVolunteerStatus.Approved,
            },
          },
        },
      },
    };
    if (query.include?.includes(GetShiftInclude.Activity)) {
      include.activity = {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          organizationId: true,
        },
      };
    }
    if (query.include?.includes(GetShiftInclude.ShiftSkill)) {
      include.shiftSkills = {
        include: {
          skill: true,
        },
      };
    }
    if (
      query.include?.includes(GetShiftInclude.ShiftVolunteer) ||
      query.include?.includes(GetShiftInclude.ShiftVolunteerProfile)
    ) {
      include.shiftVolunteers = true;
    }
    if (
      query.include?.includes(GetShiftInclude.ShiftVolunteer) != true &&
      query.include?.includes(GetShiftInclude.ShiftVolunteerProfile) != true &&
      query.include?.includes(GetShiftInclude.MyShiftVolunteer)
    ) {
      include.shiftVolunteers = {
        where: {
          accountId: context.account.id,
        },
      };
    }
    if (query.include?.includes(GetShiftInclude.ShiftManager)) {
      include.shiftManagers = true;
    }
    return include;
  }

  getShiftSort(query: GetShiftsQueryDto) {
    const sort: Prisma.ShiftOrderByWithAggregationInput = {};
    if (query.sort) {
      if (query.sort.includes(GetShiftSort.StartTimeAscending)) {
        sort.startTime = 'asc';
      } else if (query.sort.includes(GetShiftSort.StartTimeDescending)) {
        sort.startTime = 'desc';
      }
      if (query.sort.includes(GetShiftSort.EndTimeAscending)) {
        sort.endTime = 'asc';
      } else if (query.sort.includes(GetShiftSort.EndTimeDescending)) {
        sort.endTime = 'desc';
      }
    }
    return sort;
  }

  mapToOutput(context: RequestContext, raw: any): ShiftOutputDto {
    const myShiftVolunteers: VolunteerShift[] = raw.shiftVolunteers?.filter(
      (sv) => sv.accountId == context.account.id,
    );
    const myShiftVolunteer = myShiftVolunteers?.find(
      (sv) => sv.active === true,
    );
    const canCheckIn =
      myShiftVolunteer?.status === ShiftVolunteerStatus.Approved &&
      this.shiftVolunteerService.checkCanCheckIn(raw, myShiftVolunteer, false);
    const canCheckOut =
      myShiftVolunteer?.status === ShiftVolunteerStatus.Approved &&
      this.shiftVolunteerService.checkCanCheckOut(raw, myShiftVolunteer, false);

    return this.output(ShiftOutputDto, {
      ...raw,
      locations: raw.shiftLocations?.map((sl) => sl.location),
      contacts: raw.shiftContacts?.map((sc) => sc.contact),
      myShiftVolunteer: myShiftVolunteer,
      me: {
        isShiftManager: raw.shiftManagers?.some(
          (v) => v.accountId === context.account.id,
        ),
        canCheckIn: canCheckIn,
        canCheckOut: canCheckOut,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma, VolunteerShift } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { ContactService } from 'src/contact/services';
import { LocationService } from 'src/location/services';
import { PrismaService } from 'src/prisma';

import { max } from 'lodash';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
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
      joinStatusAccount: context.account.id,
    });
    const res = await this.prisma.shift.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
      include: this.getShiftInclude(context, query),
      orderBy: this.getShiftSort(query),
    });
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
    console.log(
      res.shiftVolunteers?.filter(
        (v) => v.status === ShiftVolunteerStatus.Approved,
      ).length,
    );
    return this.mapToOutput(context, res);
  }

  async createShift(
    context: RequestContext,
    dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.createShift);
    return this.prisma.$transaction(
      async () => {
        const locationIds = dto.locations
          ? (await this.locationService.createMany(context, dto.locations)).map(
              (l) => ({
                locationId: l.id,
              }),
            )
          : undefined;
        const contactIds = dto.contacts
          ? (await this.contactService.createMany(context, dto.contacts)).map(
              (d) => ({
                contactId: d.id,
              }),
            )
          : undefined;
        const res = await this.prisma.shift.create({
          data: {
            activityId: dto.activityId,
            name: dto.name,
            description: dto.description,
            numberOfParticipants: dto.numberOfParticipants,
            availableSlots: dto.numberOfParticipants,
            startTime: dto.startTime,
            endTime: dto.endTime,
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
      async () => {
        const include = this.getShiftInclude(context, query);

        const numberOfParticipants = dto.numberOfParticipants;
        let availableSlots: number | null | undefined = undefined;

        if (dto.numberOfParticipants != shift.numberOfParticipants) {
          const volunteersCount = await this.prisma.volunteerShift.count({
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

        const res = await this.prisma.shift.update({
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
                    create: dto.contacts?.map((d) => ({
                      contact: {
                        create: d,
                      },
                    })),
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
    const res = await this.prisma.shift.delete({
      where: {
        id: id,
      },
      include: include,
    });
    return this.mapToOutput(context, res);
  }

  async getShiftFilter(
    query: GetShiftsQueryDto,
    extra?: { joinStatusAccount?: number },
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

    if (query.myJoinStatus && extra?.joinStatusAccount) {
      filter.shiftVolunteers = {
        some: {
          accountId: extra.joinStatusAccount,
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
    if (query.include?.includes(GetShiftInclude.ShiftSkill)) {
      include.shiftSkills = {
        include: {
          skill: true,
        },
      };
    }
    if (query.include?.includes(GetShiftInclude.ShiftVolunteer)) {
      include.shiftVolunteers = true;
    }
    if (
      query.include?.includes(GetShiftInclude.ShiftVolunteer) != true &&
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
    const sort: Prisma.ShiftOrderByWithRelationInput = {};
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

    return this.output(ShiftOutputDto, {
      ...raw,
      locations: raw.shiftLocations.map((sl) => sl.location),
      contacts: raw.shiftContacts.map((sc) => sc.contact),
      myShiftVolunteer:
        myShiftVolunteers?.length > 0 === true
          ? myShiftVolunteers.find((sv) => sv.active === true)
          : null,
    });
  }
}

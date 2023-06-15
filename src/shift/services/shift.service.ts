import { Injectable } from '@nestjs/common';
import { Prisma, VolunteerShift } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { ContactService } from 'src/contact/services';
import { LocationService } from 'src/location/services';
import { PrismaService } from 'src/prisma';

import { maxBy } from 'lodash';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftStatus } from '../constants';
import {
  CreateShiftInputDto,
  GetShiftInclude,
  GetShiftQueryDto,
  GetShiftsQueryDto,
  ShiftOutputDto,
  UpdateShiftInputDto,
} from '../dtos';

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
    if (where === -1) {
      return [];
    }
    const res = await this.prisma.shift.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
      include: this.getShiftInclude(context, query),
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
    return this.prisma.$transaction(
      async () => {
        const include = this.getShiftInclude(context, query);
        const res = await this.prisma.shift.update({
          where: {
            id: id,
          },
          data: {
            name: dto.name,
            description: dto.description,
            numberOfParticipants: dto.numberOfParticipants,
            startTime: dto.startTime,
            endTime: dto.endTime,
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
      filter.AND = [
        {
          OR: [
            {
              numberOfParticipants: null,
            },
            {
              numberOfParticipants: {
                gte: query.numberOfParticipants[0],
                lte: query.numberOfParticipants[1],
              },
            },
          ],
        },
      ];
    }

    if (query.myJoinStatus && extra?.joinStatusAccount) {
      // Check the latest status
      const vss = await this.prisma.volunteerShift.findMany({
        where: {
          accountId: extra.joinStatusAccount,
        },
      });
      const vs = maxBy(vss, (v) => v.updatedAt);
      if (
        vs == null ||
        !query.myJoinStatus.map((v) => v.toString()).includes(vs.status)
      ) {
        return -1;
      }
      filter.shiftVolunteers = {
        some: {
          accountId: extra.joinStatusAccount,
          status: {
            in: query.myJoinStatus,
          },
        },
      };
    }
    const now = new Date();
    if (query.status) {
      const status = query.status;
      const where: any = filter.OR ? filter.OR : [];
      if (!filter.OR) {
        filter.OR = [];
      }
      if (status.includes(ShiftStatus.Pending)) {
        where.push({
          startTime: {
            gt: now,
          },
        });
      }
      if (status.includes(ShiftStatus.Ongoing)) {
        where.push({
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
        });
      }
      if (status.includes(ShiftStatus.Completed)) {
        where.push({
          endTime: {
            lt: now,
          },
        });
      }
      filter.OR = where;
    }
    if (query.availableSlots) {
    }
    console.log(JSON.stringify(filter));

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

  mapToOutput(context: RequestContext, raw: any): ShiftOutputDto {
    const myShiftVolunteers: VolunteerShift[] = raw.shiftVolunteers?.filter(
      (sv) => sv.accountId == context.account.id,
    );

    return this.output(ShiftOutputDto, {
      ...raw,
      locations: raw.shiftLocations.map((sl) => sl.location),
      contacts: raw.shiftContacts.map((sc) => sc.contact),
      joinedParticipants: raw._count.shiftVolunteers,
      myShiftVolunteer:
        myShiftVolunteers?.length > 0 === true
          ? maxBy(myShiftVolunteers, (sv) => sv.updatedAt)
          : null,
    });
  }
}

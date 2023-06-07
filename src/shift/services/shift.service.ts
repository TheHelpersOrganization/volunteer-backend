import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { ContactService } from 'src/contact/services';
import { LocationService } from 'src/location/services';
import { PrismaService } from 'src/prisma';

import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import {
  CreateShiftInputDto,
  GetShiftByIdQueryDto,
  GetShiftInclude,
  GetShiftQueryDto,
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
    const updated = res.map((shift) => this.mapToOutput(shift));
    return this.outputArray(ShiftOutputDto, updated);
  }

  async getShifts(context: RequestContext, query: GetShiftQueryDto) {
    this.logCaller(context, this.getShifts);
    const res = await this.prisma.shift.findMany({
      where: this.getShiftFilter(query),
      take: query.limit,
      skip: query.offset,
      include: this.getShiftInclude(query),
    });
    return res.map((r) => this.mapToOutput(r));
  }

  async getById(
    context: RequestContext,
    id: number,
    query: GetShiftByIdQueryDto,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.shift.findUnique({
      where: {
        id: id,
      },
      include: this.getShiftInclude(query),
    });
    if (res == null) {
      return null;
    }
    return this.mapToOutput(res);
  }

  async create(
    context: RequestContext,
    dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.create);
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
        return this.mapToOutput(res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.update);
    return this.prisma.$transaction(
      async () => {
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
            // shiftVolunteers: {
            //   deleteMany: {
            //     accountId: {
            //       notIn: dto.shiftVolunteerIds,
            //     },
            //   },
            //   upsert: dto.shiftVolunteerIds.map((d) => ({
            //     where: {
            //       shiftId_accountId: {
            //         shiftId: id,
            //         accountId: d,
            //       },
            //     },
            //     create: {
            //       accountId: d,
            //       status: VolunteerShiftStatus.Pending,
            //     },
            //     update: {},
            //   })),
            // },
            shiftLocations: {
              deleteMany: {},
              create: dto.locations.map((d) => ({
                location: {
                  create: d,
                },
              })),
            },
            shiftContacts: {
              deleteMany: {},
              create: dto.contacts.map((d) => ({
                contact: {
                  create: d,
                },
              })),
            },
            shiftSkills: {
              deleteMany: {},
              create: dto.shiftSkills,
            },
            shiftManagers: {
              deleteMany: {},
              create: dto.shiftManagers,
            },
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
        return this.mapToOutput(res);
      },
      {
        timeout: 15000,
      },
    );
  }

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.delete);
    const res = await this.prisma.shift.delete({
      where: {
        id: id,
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
    return this.mapToOutput(res);
  }

  getShiftFilter(query: GetShiftQueryDto): Prisma.ShiftWhereInput {
    const filter: Prisma.ShiftWhereInput = {};
    if (query.id != null) {
      filter.id = {
        in: query.id,
      };
    }
    if (query.activityId != null) {
      filter.activityId = query.activityId;
    }
    return filter;
  }

  getShiftInclude(query: GetShiftQueryDto) {
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
    if (query.include?.includes(GetShiftInclude.ShiftManager)) {
      include.shiftManagers = true;
    }
    return include;
  }

  mapToOutput(raw: any): ShiftOutputDto {
    return this.output(ShiftOutputDto, {
      ...raw,
      locations: raw.shiftLocations.map((sl) => sl.location),
      contacts: raw.shiftContacts.map((sc) => sc.contact),
      joinedParticipants: raw._count.shiftVolunteers,
    });
  }
}

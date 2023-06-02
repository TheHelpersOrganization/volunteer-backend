import { Injectable } from '@nestjs/common';
import {
  Contact,
  Location,
  Prisma,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftSkill,
} from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { ContactService } from 'src/contact/services';
import { LocationService } from 'src/location/services';
import { PrismaService } from 'src/prisma';
import {
  CreateShiftInputDto,
  GetShiftQueryDto,
  ShiftOutputDto,
  UpdateShiftInputDto,
} from '../dtos';

@Injectable()
export class ModShiftService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
  ) {
    super(logger);
  }

  async getShifts(context: RequestContext, query: GetShiftQueryDto) {
    this.logCaller(context, this.getShifts);
    const res = await this.prisma.shift.findMany({
      where: this.getShiftFilter(query),
      take: query.limit,
      skip: query.offset,
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
    return res.map((r) => this.mapToOutput(r));
  }

  async getShiftById(
    context: RequestContext,
    id: number,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.getShiftById);
    const res = await this.prisma.shift.findUnique({
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
    if (res == null) {
      return null;
    }
    return this.mapToOutput(res);
  }

  async createShift(
    context: RequestContext,
    activityId: number,
    dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.createShift);
    return this.prisma.$transaction(
      async () => {
        const locationIds = (
          await this.locationService.createMany(context, dto.locations)
        ).map((l) => ({
          locationId: l.id,
        }));
        const contactIds = (
          await this.contactService.createMany(context, dto.contacts)
        ).map((d) => ({
          contactId: d.id,
        }));
        const res = await this.prisma.shift.create({
          data: {
            activityId: activityId,
            name: dto.name,
            description: dto.description,
            numberOfParticipants: dto.numberOfParticipants,
            startTime: dto.startTime,
            endTime: dto.endTime,
            shiftLocations: {
              createMany: {
                data: locationIds,
              },
            },
            shiftContacts: {
              createMany: {
                data: contactIds,
              },
            },
            shiftSkills: {
              createMany: {
                data: dto.shiftSkills,
              },
            },
            // shiftVolunteers: {
            //   create: dto.shiftVolunteerIds.map((d) => ({
            //     accountId: d,
            //     status: VolunteerShiftStatus.Pending,
            //   })),
            // },
            shiftManagers: {
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

  async updateShift(
    context: RequestContext,
    id: number,
    dto: UpdateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    this.logCaller(context, this.updateShift);
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

  async deleteShift(
    context: RequestContext,
    id: number,
  ): Promise<ShiftOutputDto | null> {
    this.logCaller(context, this.deleteShift);
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

  mapToOutput(
    raw: Shift & {
      shiftLocations: (ShiftLocation & {
        location: Location;
      })[];
      shiftContacts: (ShiftContact & {
        contact: Contact;
      })[];
      shiftSkills: ShiftSkill[];
    },
  ): ShiftOutputDto {
    return this.output(ShiftOutputDto, {
      ...raw,
      locations: raw.shiftLocations.map((sl) => sl.location),
      contacts: raw.shiftContacts.map((sc) => sc.contact),
    });
  }
}

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
import { GetShiftsQueryDto, ShiftOutputDto } from '../dtos';

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

  async getShifts(context: RequestContext, query: GetShiftsQueryDto) {
    this.logCaller(context, this.getShifts);
    const res = await this.prisma.shift.findMany({
      where: this.getShiftFilter(query, {
        joinStatusAccount: context.account.id,
      }),
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

  getShiftFilter(
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
      filter.numberOfParticipants = {
        gte: query.numberOfParticipants[0],
        lte: query.numberOfParticipants[1],
      };
    }

    if (query.myJoinStatus && extra?.joinStatusAccount) {
      filter.shiftVolunteers = {
        some: {
          accountId: extra.joinStatusAccount,
          status: {
            in: query.myJoinStatus,
          },
        },
      };
    }
    if (query.availableSlots) {
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

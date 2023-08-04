import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { ContactService } from '@app/contact/services';
import { LocationService } from '@app/location/services';
import { PrismaService } from '@app/prisma';
import { ProfileService } from '@app/profile/services';
import { Injectable } from '@nestjs/common';
import {
  Contact,
  Location,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftSkill,
} from '@prisma/client';
import { GetShiftInclude, GetShiftsQueryDto, ShiftOutputDto } from '../dtos';
import { ShiftService } from './shift.service';

@Injectable()
export class ModShiftService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly contactService: ContactService,
    private readonly shiftService: ShiftService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getShifts(context: RequestContext, query: GetShiftsQueryDto) {
    this.logCaller(context, this.getShifts);
    const where = await this.shiftService.getShiftFilter(query, {
      contextAccountId: context.account.id,
    });
    const res: any = await this.prisma.shift.findMany({
      where: where,
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
    if (
      query.include?.includes(GetShiftInclude.ShiftVolunteerProfile) &&
      res.shiftVolunteers
    ) {
      const profiles = await this.profileService.getProfiles(
        context,
        res.shiftVolunteers.map((v) => v.accountId),
      );
      res.shiftVolunteers.forEach((v) => {
        v.profile = profiles.find((p) => p.id === v.accountId);
      });
    }
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

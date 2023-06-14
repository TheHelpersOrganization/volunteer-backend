import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import { ShiftSkillService } from 'src/shift-skill/services';
import {
  InvalidStatusException,
  ShiftHasAlreadyStartedException,
  ShiftIsFullException,
  ShiftNotFoundException,
} from 'src/shift/exceptions';
import { ShiftVolunteerStatus } from '../constants';
import {
  CreateShiftVolunteerInputDto,
  GetShiftVolunteerQueryDto,
  ShiftVolunteerInclude,
  ShiftVolunteerOutputDto,
  UpdateShiftVolunteerInputDto,
  UpdateShiftVolunteerStatus,
} from '../dtos';
import {
  VolunteerHasAlreadyJoinedShiftException,
  VolunteerHasNotJoinedShiftException,
  VolunteerStatusNotApprovedException,
} from '../exception';

@Injectable()
export class ShiftVolunteerService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly shiftSkillService: ShiftSkillService,
  ) {
    super(logger);
  }

  async getShiftVolunteers(
    context: RequestContext,
    query: GetShiftVolunteerQueryDto,
  ) {
    this.logCaller(context, this.getShiftVolunteers);

    const include = this.getShiftVolunteerInclude(query);
    const res = await this.prisma.volunteerShift.findMany({
      where: this.getShiftVolunteerFilter(query, context.account.id),
      take: query.limit,
      skip: query.offset,
      cursor:
        query.cursor != null
          ? {
              id: query.cursor,
            }
          : undefined,
      include: include,
    });

    let totalPending: number | undefined = undefined;
    let totalApproved: number | undefined = undefined;
    if (query.status?.includes(ShiftVolunteerStatus.Approved) == true) {
      totalApproved = await this.prisma.volunteerShift.count({
        where: this.getShiftVolunteerCountFilter(
          query,
          ShiftVolunteerStatus.Approved,
        ),
      });
    }
    if (query.status?.includes(ShiftVolunteerStatus.Pending) == true) {
      totalPending = await this.prisma.volunteerShift.count({
        where: this.getShiftVolunteerCountFilter(
          query,
          ShiftVolunteerStatus.Pending,
        ),
      });
    }

    if (query.meetSkillRequirements) {
      const skillRequirementGroupedByShift: any = {};
      const shiftRequirements = await this.prisma.shiftSkill.findMany({
        where: {
          shiftId: { in: res.map((v) => v.shiftId) },
        },
      });
      shiftRequirements.forEach((r) => {
        if (skillRequirementGroupedByShift[r.shiftId] == null) {
          skillRequirementGroupedByShift[r.shiftId] = [];
        }
        skillRequirementGroupedByShift[r.shiftId].push(r);
      });
      const skillHours = await this.shiftSkillService.getVolunteersSkillHours(
        res.map((v) => v.accountId),
      );
      res.forEach((r) => {
        const requirements = skillRequirementGroupedByShift[r.shiftId];
        for (const requirement of requirements) {
          const skill = skillHours[r.accountId].find(
            (s) => s.skillId === requirement.skillId,
          );
          if (skill == null || skill.hours < requirement.hours) {
            const i = res.findIndex(
              (v) => v.accountId == r.accountId && v.shiftId == r.shiftId,
            );
            res.splice(i, 1);
            break;
          }
        }
      });
    }

    if (query.include?.includes(ShiftVolunteerInclude.Profile) == true) {
      const accountIds = res.map((v) => v.accountId);
      const profiles = await this.profileService.getProfiles(context, {
        ids: accountIds,
        select: getProfileBasicSelect,
      });
      const extendedRes = res.map((v) => ({
        ...v,
        profile: profiles.find((p) => p.id === v.accountId),
      }));
      return this.extendedOutputArray(ShiftVolunteerOutputDto, extendedRes, {
        totalPending,
        totalApproved,
        count: res.length,
      });
    }
    return this.extendedOutputArray(ShiftVolunteerOutputDto, res, {
      totalPending,
      totalApproved,
      count: res.length,
    });
  }

  getShiftVolunteerFilter(
    query: GetShiftVolunteerQueryDto,
    requesterId: number,
  ): Prisma.VolunteerShiftWhereInput {
    const filter: Prisma.VolunteerShiftWhereInput = {};

    if (query.id) {
      filter.id = { in: query.id };
    }

    if (query.shiftId) {
      filter.shiftId = query.shiftId;
    }

    if (query.activityId) {
      filter.shift = { activityId: query.activityId };
    }

    if (query.mine) {
      filter.accountId = requesterId;
    }

    if (query.status) {
      filter.status = { in: query.status };
    }

    if (query.name) {
      filter.account = {
        OR: [
          { email: { contains: query.name, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { username: { contains: query.name, mode: 'insensitive' } },
                { firstName: { contains: query.name, mode: 'insensitive' } },
                { lastName: { contains: query.name, mode: 'insensitive' } },
              ],
            },
          },
        ],
      };
    }

    return filter;
  }

  getShiftVolunteerCountFilter(
    query: GetShiftVolunteerQueryDto,
    status: ShiftVolunteerStatus,
  ): Prisma.VolunteerShiftWhereInput {
    const filter: Prisma.VolunteerShiftWhereInput = {};

    if (query.shiftId) {
      filter.shiftId = query.shiftId;
    }

    if (query.activityId) {
      filter.shift = { activityId: query.activityId };
    }

    if (query.status) {
      filter.status = status;
    }

    return filter;
  }

  getShiftVolunteerInclude(query: GetShiftVolunteerQueryDto) {
    const include: Prisma.VolunteerShiftInclude = {};
    if (query.include?.includes(ShiftVolunteerInclude.Shift) == true) {
      include.shift = true;
    }
    return include;
  }

  async getApprovedByActivityId(
    context: RequestContext,
    activityId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getApprovedByActivityId);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        shift: {
          activityId: activityId,
        },
        status: ShiftVolunteerStatus.Approved,
      },
    });
    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getByShiftId(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getByShiftId);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        shiftId: shiftId,
      },
    });

    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getMe(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    this.logCaller(context, this.getMe);
    const res = await this.prisma.volunteerShift.findMany({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
      },
    });
    return this.outputArray(ShiftVolunteerOutputDto, res);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(ShiftVolunteerOutputDto, res);
  }

  async join(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.join);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
      include: {
        shiftVolunteers: true,
      },
    });

    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const pendingOrApprovedShiftVolunteer = shift.shiftVolunteers.find(
      (v) =>
        v.accountId === context.account.id &&
        (v.status === ShiftVolunteerStatus.Pending ||
          v.status === ShiftVolunteerStatus.Approved),
    );
    if (pendingOrApprovedShiftVolunteer != null) {
      throw new VolunteerHasAlreadyJoinedShiftException();
    }

    const approvedShiftVolunteers = shift.shiftVolunteers.filter(
      (v) => v.status === ShiftVolunteerStatus.Approved,
    );

    const currentDate = new Date();
    if (shift.startTime < currentDate) {
      throw new ShiftHasAlreadyStartedException();
    }

    if (
      shift.numberOfParticipants != null &&
      shift.numberOfParticipants != 0 &&
      approvedShiftVolunteers.length >= shift.numberOfParticipants
    ) {
      throw new ShiftIsFullException();
    }

    const res = await this.prisma.volunteerShift.create({
      data: {
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Pending,
        shiftId: shiftId,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async cancelJoin(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.cancelJoin);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Pending,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: shiftVolunteer.id,
      },
      data: {
        status: ShiftVolunteerStatus.Cancelled,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async leave(
    context: RequestContext,
    shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.leave);
    const shift = await this.prisma.shift.findFirst({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const shiftVolunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: ShiftVolunteerStatus.Approved,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }

    const currentDate = new Date();
    if (shift.startTime < currentDate) {
      throw new ShiftHasAlreadyStartedException();
    }

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: shiftVolunteer.id,
      },
      data: {
        status: ShiftVolunteerStatus.Leaved,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async create(
    context: RequestContext,
    shiftId: number,
    dto: CreateShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.create);

    const res = await this.prisma.volunteerShift.create({
      data: {
        ...dto,
        status: ShiftVolunteerStatus.Pending,
        shiftId: shiftId,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async update(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: UpdateShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.update);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }
    if (shiftVolunteer.status != ShiftVolunteerStatus.Approved) {
      throw new InvalidStatusException();
    }

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: id,
      },
      data: dto,
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async updateRegistrationStatus(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: UpdateShiftVolunteerStatus,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.updateRegistrationStatus);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
      },
    });
    if (shiftVolunteer == null) {
      throw new InvalidStatusException();
    }
    if (shiftVolunteer.status != ShiftVolunteerStatus.Pending) {
      throw new InvalidStatusException();
    }

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: id,
      },
      data: {
        status: dto.status,
        censorId: context.account.id,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async remove(
    context: RequestContext,
    shiftId: number,
    id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.remove);

    const shift = await this.prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }

    const shiftVolunteer = await this.prisma.volunteerShift.findUnique({
      where: {
        id: id,
      },
    });
    if (shiftVolunteer == null) {
      throw new VolunteerHasNotJoinedShiftException();
    }
    if (shiftVolunteer.status != ShiftVolunteerStatus.Approved) {
      throw new VolunteerStatusNotApprovedException();
    }

    const res = await this.prisma.volunteerShift.update({
      where: {
        id: id,
      },
      data: {
        status: ShiftVolunteerStatus.Removed,
        censorId: context.account.id,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }
}

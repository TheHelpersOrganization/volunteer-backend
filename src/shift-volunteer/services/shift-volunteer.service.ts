import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
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
  ) {
    super(logger);
  }

  async getShiftVolunteers(
    context: RequestContext,
    query: GetShiftVolunteerQueryDto,
  ) {
    this.logCaller(context, this.getShiftVolunteers);
    const res = await this.prisma.volunteerShift.findMany({
      where: this.getShiftVolunteerFilter(query, context.account.id),
      take: query.limit,
      skip: query.offset,
    });
    const accountIds = res.map((v) => v.accountId);
    const profiles = await this.profileService.getProfiles(context, {
      ids: accountIds,
      select: getProfileBasicSelect,
    });
    if (query.include?.includes(ShiftVolunteerInclude.Profile) == true) {
      const extendedRes = res.map((v) => ({
        ...v,
        profile: profiles.find((p) => p.id === v.accountId),
      }));
      return this.outputArray(ShiftVolunteerOutputDto, extendedRes);
    }
    return this.outputArray(ShiftVolunteerOutputDto, res);
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

    return filter;
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

    const shiftVolunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
        accountId: context.account.id,
        status: {
          in: [ShiftVolunteerStatus.Pending, ShiftVolunteerStatus.Approved],
        },
      },
    });
    if (shiftVolunteer != null) {
      throw new VolunteerHasAlreadyJoinedShiftException();
    }

    const currentDate = new Date();
    if (shift.startTime < currentDate) {
      throw new ShiftHasAlreadyStartedException();
    }

    if (
      shift.numberOfParticipants != null &&
      shift.numberOfParticipants != 0 &&
      shift.shiftVolunteers.length >= shift.numberOfParticipants
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

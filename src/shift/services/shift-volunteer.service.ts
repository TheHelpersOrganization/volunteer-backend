import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftVolunteerStatus } from '../constants';
import {
  CreateShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  UpdateShiftVolunteerInputDto,
  UpdateShiftVolunteerStatus,
} from '../dtos';
import {
  InvalidStatusException,
  ShiftIsFullException,
  ShiftNotFoundException,
  VolunteerHasAlreadyJoinedShiftException,
  VolunteerHasNotJoinedShiftException,
  VolunteerStatusNotApprovedException,
} from '../exceptions';
import { ShiftHasAlreadyStartedException } from '../exceptions/shift-has-already-started.exception';

@Injectable()
export class ShiftVolunteerService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
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
    shiftId: number,
    id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.volunteerShift.findFirst({
      where: {
        shiftId: shiftId,
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

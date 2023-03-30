import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { VolunteerShiftStatus } from '../constants';
import {
  CreateShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  UpdateShiftVolunteerInputDto,
  UpdateShiftVolunteerStatus,
} from '../dtos';
import {
  ShiftIsFullException,
  ShiftNotFoundException,
  VolunteerHasAlreadyJoinedShiftException,
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

  async getById(
    context: RequestContext,
    shiftId: number,
    id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.volunteerShift.findUnique({
      where: {
        shiftId_accountId: {
          shiftId: shiftId,
          accountId: id,
        },
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

    if (
      shift.shiftVolunteers.findIndex(
        (x) => x.accountId == context.account.id,
      ) != -1
    ) {
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
        status: VolunteerShiftStatus.Pending,
        shiftId: shiftId,
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
        status: VolunteerShiftStatus.Pending,
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

    const res = await this.prisma.volunteerShift.update({
      where: {
        shiftId_accountId: {
          shiftId: shiftId,
          accountId: id,
        },
      },
      data: dto,
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async updateStatus(
    context: RequestContext,
    shiftId: number,
    id: number,
    dto: UpdateShiftVolunteerStatus,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.updateStatus);

    const res = await this.prisma.volunteerShift.update({
      where: {
        shiftId_accountId: {
          shiftId: shiftId,
          accountId: id,
        },
      },
      data: {
        status: dto.status,
        censorId: context.account.id,
      },
    });

    return this.output(ShiftVolunteerOutputDto, res);
  }

  async delete(
    context: RequestContext,
    shiftId: number,
    id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    this.logCaller(context, this.delete);

    const res = await this.prisma.volunteerShift.delete({
      where: {
        shiftId_accountId: {
          shiftId: shiftId,
          accountId: id,
        },
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
        shiftVolunteers: {
          some: {
            accountId: context.account.id,
          },
        },
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const currentDate = new Date();
    if (shift.startTime < currentDate) {
      throw new ShiftHasAlreadyStartedException();
    }
    return this.delete(context, shiftId, context.account.id);
  }
}

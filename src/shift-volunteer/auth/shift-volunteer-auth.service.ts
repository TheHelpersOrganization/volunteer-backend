import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { ShiftStatus } from '@app/shift/constants';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ShiftVolunteerOutputDto } from '../dtos';

@Injectable()
export class ShiftVolunteerAuthService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async validateIsVolunteerOfShift(data: {
    accountId: number;
    shiftId: number;
  }) {
    const volunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        accountId: data.accountId,
        shiftId: data.shiftId,
        active: true,
      },
    });
    if (volunteer == null) {
      throw new ForbiddenException();
    }
    return this.output(ShiftVolunteerOutputDto, volunteer);
  }

  async validateCanRateShift(data: { accountId: number; shiftId: number }) {
    const volunteer = await this.prisma.volunteerShift.findFirst({
      where: {
        accountId: data.accountId,
        shiftId: data.shiftId,
        shift: {
          id: data.shiftId,
          status: ShiftStatus.Completed,
        },
        active: true,
      },
    });
    if (volunteer == null) {
      throw new ForbiddenException();
    }
    return this.output(ShiftVolunteerOutputDto, volunteer);
  }
}

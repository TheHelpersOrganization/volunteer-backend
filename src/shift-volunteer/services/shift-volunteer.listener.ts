import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { ShiftVolunteerReviewedEvent } from '@app/shift-volunteer/events';
import { ShiftStatus } from '@app/shift/constants';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ShiftVolunteerStatus } from '../constants';

@Injectable()
export class ShiftVolunteerListener extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
  ) {
    super(logger);
  }

  // Update metSkillRequirement if shiftVolunteer is reviewed
  // Wait for profile skill to be updated
  @OnEvent(ShiftVolunteerReviewedEvent.eventName, { nextTick: true })
  async onShiftVolunteerReviewed(event: ShiftVolunteerReviewedEvent) {
    const context = event.context;
    this.logCaller(context, this.onShiftVolunteerReviewed);

    const shiftVolunteer = event.next;
    const shiftVolunteers = await this.prismaService.volunteerShift.findMany({
      where: {
        accountId: shiftVolunteer.accountId,
        shift: {
          status: { not: ShiftStatus.Completed },
        },
        status: {
          in: [ShiftVolunteerStatus.Pending, ShiftVolunteerStatus.Approved],
        },
      },
    });
  }
}

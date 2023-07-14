import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftVolunteerReviewedEvent } from 'src/shift-volunteer/events';
import { ShiftStatus } from 'src/shift/constants';
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

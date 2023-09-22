import { ActivityNotFoundException } from '@app/activity/exceptions';
import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import {
  ShiftVolunteerRatedEvent,
  ShiftVolunteerReviewedEvent,
} from '@app/shift-volunteer/events';
import { ShiftStatus } from '@app/shift/constants';
import { ShiftNotFoundException } from '@app/shift/exceptions';
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

  @OnEvent(ShiftVolunteerRatedEvent.eventName)
  async onShiftVolunteerRated(event: ShiftVolunteerRatedEvent) {
    const context = event.context;
    this.logCaller(context, this.onShiftVolunteerRated);

    // Get the activity id
    const activityId = (
      await this.prismaService.shift.findUnique({
        where: {
          id: event.next.shiftId,
        },
        select: {
          activityId: true,
        },
      })
    )?.activityId;
    if (activityId == null) {
      throw new ActivityNotFoundException();
    }
    const shift = await this.prismaService.shift.findUnique({
      where: {
        id: event.next.shiftId,
      },
      include: {
        shiftVolunteers: {
          where: {
            status: ShiftVolunteerStatus.Approved,
            shiftRating: {
              not: null,
            },
          },
        },
      },
    });
    if (shift == null) {
      throw new ShiftNotFoundException();
    }
    const shiftRating =
      shift?.shiftVolunteers.reduce(
        (sum, shiftVolunteer) => sum + shiftVolunteer.shiftRating!,
        0,
      ) / shift?.shiftVolunteers.length;

    // Update the shift rating
    await this.prismaService.shift.update({
      where: {
        id: event.next.shiftId,
      },
      data: {
        rating: shiftRating,
      },
    });

    // Get average rating of shift
    const shifts = await this.prismaService.shift.findMany({
      where: {
        activityId: activityId,
        status: ShiftStatus.Completed,
      },
      select: {
        rating: true,
      },
    });
    const averageRating =
      shifts.reduce((sum, shift) => sum + shift.rating!, 0) / shifts.length;

    // Update the activity rating
    await this.prismaService.activity.update({
      where: {
        id: activityId,
      },
      data: {
        rating: averageRating,
      },
    });
  }
}

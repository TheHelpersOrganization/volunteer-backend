import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftVolunteerReviewedEvent } from 'src/shift-volunteer/events';

@Injectable()
export class ProfileSkillService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prismaService: PrismaService,
  ) {
    super(logger);
  }

  async onShiftVolunteerReviewed(event: ShiftVolunteerReviewedEvent) {
    const context = event.context;
    this.logCaller(context, this.onShiftVolunteerReviewed);
    // TODO: When shift time is updated, we may need to update profile skill
    const duration = dayjs(event.shift.endTime).diff(
      dayjs(event.shift.startTime, 'hour'),
    );
    const shiftVolunteer = event.next;
    const previousShiftVolunteer = event.previous;
    const shiftSkills = await this.prismaService.shiftSkill.findMany({
      where: {
        shiftId: shiftVolunteer.shiftId,
      },
    });
    const profileSkills = await this.prismaService.profileSkill.findMany({
      where: {
        profileId: shiftVolunteer.accountId,
      },
    });
    const shiftSkillHours = shiftSkills.map((shiftSkill) => {
      const existingProfileSkillHours =
        profileSkills.find(
          (profileSkill) => profileSkill.skillId === shiftSkill.skillId,
        )?.hours ?? 0;
      const previousHours = duration * (previousShiftVolunteer.completion ?? 0);
      const nextHours = duration * (shiftVolunteer.completion ?? 0);
      // profile skill hours + shift skill hours - previous shift skill hours
      return {
        profileId: shiftVolunteer.accountId,
        skillId: shiftSkill.skillId,
        hours: existingProfileSkillHours + nextHours - previousHours,
      };
    });
    await this.prismaService.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({
        where: {
          profileId: shiftVolunteer.accountId,
        },
      });
      await tx.profileSkill.createMany({
        data: shiftSkillHours,
      });
    });
  }
}

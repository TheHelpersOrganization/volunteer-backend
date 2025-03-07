import { ActivityStatus } from '@app/activity/constants';
import { AppLogger } from '@app/common/logger';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { Injectable } from '@nestjs/common';
import { ShiftSkill, Skill } from '@prisma/client';
import { round } from 'lodash';
import { ShiftSkillOutputDto } from '../dtos';

@Injectable()
export class ShiftSkillService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getShiftSkills(shiftId: number): Promise<ShiftSkillOutputDto[]> {
    const res = await this.prisma.shiftSkill.findMany({
      where: {
        shiftId: shiftId,
      },
    });
    return this.outputArray(ShiftSkillOutputDto, res);
  }

  async getVolunteerShiftSkills(
    volunteerId: number,
    includes?: {
      skill?: boolean;
    },
  ): Promise<ShiftSkillOutputDto[]> {
    const res = await this.prisma.shiftSkill.findMany({
      where: {
        shift: {
          shiftVolunteers: {
            every: {
              accountId: volunteerId,
            },
          },
        },
      },
      include: {
        skill: includes?.skill,
      },
    });

    return this.outputArray(ShiftSkillOutputDto, res);
  }

  async getVolunteerSkillHours(
    volunteerId: number,
    includes?: {
      skill?: boolean;
    },
  ): Promise<ShiftSkillOutputDto[]> {
    const volunteerShifts = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: volunteerId,
        status: ShiftVolunteerStatus.Approved,
        shift: { activity: { status: ActivityStatus.Completed } },
      },
    });
    const shiftSkills = await this.prisma.shiftSkill.findMany({
      where: {
        shiftId: { in: volunteerShifts.map((v) => v.shiftId) },
      },
      include: {
        skill: includes?.skill,
      },
    });
    let res: (ShiftSkill & {
      skill: Skill;
    })[] = [];
    shiftSkills.forEach((shiftSkill) => {
      const existing = res.find((s) => s.skillId === shiftSkill.skillId);
      const completion =
        volunteerShifts.find((v) => v.shiftId === shiftSkill.shiftId)
          ?.completion ?? 0;
      if (existing) {
        existing.hours += shiftSkill.hours * completion;
      } else {
        res.push({ ...shiftSkill, hours: shiftSkill.hours * completion });
      }
    });
    res = res.filter((r) => r.hours > 0);

    res.forEach((e) => {
      e.hours = round(e.hours, 1);
    });

    return this.outputArray(ShiftSkillOutputDto, res);
  }

  async getVolunteersSkillHours(
    volunteerIds: number[],
    includes?: {
      skill?: boolean;
    },
  ) {
    const volunteerShifts = await this.prisma.volunteerShift.findMany({
      where: {
        accountId: {
          in: volunteerIds,
        },
        status: ShiftVolunteerStatus.Approved,
        shift: { activity: { status: ActivityStatus.Completed } },
      },
    });
    const shiftSkills = await this.prisma.shiftSkill.findMany({
      where: {
        shiftId: { in: volunteerShifts.map((v) => v.shiftId) },
      },
      include: {
        skill: includes?.skill,
      },
    });
    const res: { [accountId: number]: (ShiftSkill & { skill: Skill })[] } = {};
    volunteerShifts.forEach((volunteerShift) => {
      const totalShiftSkills: any = res[volunteerShift.accountId] ?? [];
      const filteredShiftSkills = shiftSkills.filter(
        (s) => s.shiftId === volunteerShift.shiftId,
      );
      const completion = volunteerShift.completion ?? 0;
      filteredShiftSkills.forEach((shiftSkill) => {
        const existing = totalShiftSkills.find(
          (s) => s.skillId === shiftSkill.skillId,
        );
        if (existing) {
          existing.hours += shiftSkill.hours * completion;
        } else {
          totalShiftSkills.push({
            ...shiftSkill,
            hours: shiftSkill.hours * completion,
            shiftId: undefined,
          });
        }
      });
      res[volunteerShift.accountId] = totalShiftSkills;
    });
    for (const key in res) {
      const element = res[key];
      element.forEach((e) => {
        e.hours = round(e.hours, 1);
      });
    }
    return res;
  }
}

import { Injectable } from '@nestjs/common';
import { ShiftSkill, Skill } from '@prisma/client';
import { ActivityStatus } from 'src/activity/constants';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { ShiftSkillOutputDto } from '../dtos';

@Injectable()
export class ShiftSkillService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
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
    const shiftSkills = await this.prisma.shiftSkill.findMany({
      where: {
        shift: {
          shiftVolunteers: {
            every: {
              accountId: volunteerId,
            },
          },
          activity: {
            status: ActivityStatus.Completed,
          },
        },
      },
      include: {
        skill: includes?.skill,
      },
    });
    const res: (ShiftSkill & {
      skill: Skill;
    })[] = [];
    shiftSkills.forEach((shiftSkill) => {
      const existing = res.find((s) => s.skillId === shiftSkill.skillId);
      if (existing) {
        existing.hours += shiftSkill.hours;
      } else {
        res.push(shiftSkill);
      }
    });
    return this.outputArray(ShiftSkillOutputDto, res);
  }
}

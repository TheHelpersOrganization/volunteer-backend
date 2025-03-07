import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import {
  PrismaClient,
  ProfileSkill,
  Shift,
  ShiftSkill,
  VolunteerShift,
} from '@prisma/client';
import dayjs from 'dayjs';

export const seedProfileSkills = async (
  prisma: PrismaClient,
  shifts: Shift[],
  shiftVolunteers: VolunteerShift[],
  shiftSkills: ShiftSkill[],
  options?: {
    runWithoutDb?: boolean;
  },
) => {
  const profileSkillData: ProfileSkill[] = [];

  shiftVolunteers
    .filter(
      (sv) =>
        sv.completion != null && sv.status === ShiftVolunteerStatus.Approved,
    )
    .forEach((shiftVolunteer) => {
      const shift = shifts.find((s) => s.id === shiftVolunteer.shiftId);
      const duration = dayjs(shift?.endTime).diff(shift?.startTime, 'hour');
      const skills = shiftSkills.filter(
        (ss) => ss.shiftId === shiftVolunteer.shiftId,
      );
      skills.forEach((skill) => {
        const existingProfileSkill = profileSkillData.find(
          (es) =>
            es.skillId === skill.skillId &&
            es.profileId === shiftVolunteer.accountId,
        );
        if (existingProfileSkill != null) {
          existingProfileSkill.hours +=
            duration * (shiftVolunteer.completion ?? 0);
        } else {
          profileSkillData.push({
            profileId: shiftVolunteer.accountId,
            skillId: skill.skillId,
            hours: duration * (shiftVolunteer.completion ?? 0),
            createdAt: shiftVolunteer.updatedAt,
            updatedAt: shiftVolunteer.updatedAt,
          });
        }
      });
    });

  if (options?.runWithoutDb) {
    return {
      profileSkills: profileSkillData,
    };
  }

  await prisma.profileSkill.createMany({
    data: profileSkillData,
  });

  return {
    profileSkills: profileSkillData,
  };
};

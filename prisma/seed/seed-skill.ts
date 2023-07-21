import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { PrismaClient, Skill } from '@prisma/client';
import { SkillType, getNextSkillId } from './utils';

export const skills: Skill[] = [
  {
    id: getNextSkillId(),
    name: SkillType.Health,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Food,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Education,
    description: fakerEn.lorem.paragraphs(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Equality,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Climate,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Conservation,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: SkillType.Job,
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const skillFromSkillType = (skillType: SkillType): Skill => {
  return skills.find((x) => x.name === skillType)!;
};

export const skillTypeFromSkillId = (id: number): SkillType => {
  const name = skills.find((x) => x.id === id)!.name;
  return name as SkillType;
};

export const seedSkills = async (
  prisma: PrismaClient,
  options?: { runWithoutDb?: boolean },
) => {
  if (options?.runWithoutDb) {
    return {
      skills,
    };
  }

  await prisma.skill.createMany({
    data: skills,
  });

  return {
    skills,
  };
};

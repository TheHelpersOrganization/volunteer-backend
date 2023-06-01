import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { PrismaClient, Skill } from '@prisma/client';
import { getNextSkillId } from './utils';

export const skills: Skill[] = [
  {
    id: getNextSkillId(),
    name: 'Health',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Food',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Education',
    description: fakerEn.lorem.paragraphs(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Equality',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Climate',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Conservation',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: getNextSkillId(),
    name: 'Job',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const seedSkills = async (prisma: PrismaClient) => {
  await prisma.skill.createMany({
    data: skills,
  });

  return {
    skills,
  };
};

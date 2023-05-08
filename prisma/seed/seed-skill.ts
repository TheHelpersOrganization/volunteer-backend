import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { PrismaClient, Skill } from '@prisma/client';

export const skills: Skill[] = [
  {
    id: 1,
    name: 'Health',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Food',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Education',
    description: fakerEn.lorem.paragraphs(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'Equality',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: 'Climate',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: 'Conservation',
    description: fakerEn.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
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

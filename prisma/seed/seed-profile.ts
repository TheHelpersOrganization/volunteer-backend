import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import {
  Account,
  Location,
  PrismaClient,
  Profile,
  ProfileInterestedSkill,
  Skill,
} from '@prisma/client';
import { randomInt } from 'crypto';
import * as _ from 'lodash';
import { Gender } from '../../src/profile/constants';
import { generateViLocation, generateViName } from './utils';

export const seedProfiles = async (
  prisma: PrismaClient,
  accounts: Account[],
  skills: Skill[],
) => {
  const locations: Location[] = Array.from({ length: accounts.length }).map(
    () => generateViLocation(),
  );

  const profiles: Profile[] = accounts.map((account, i) => {
    const createdAt = fakerVi.date.between(
      account.createdAt ?? new Date(),
      new Date(),
    );
    const updatedAt = fakerVi.date.between(createdAt, new Date());
    const gender = _.sample(Object.values(Gender)) ?? Gender.Male;
    let genderName: 'male' | 'female';
    if (gender === Gender.Male) {
      genderName = 'male';
    } else if (gender === Gender.Female) {
      genderName = 'female';
    } else {
      genderName = _.sample(['male', 'female']) ?? 'male';
    }
    const { firstName, lastName } = generateViName(genderName);

    return {
      accountId: account.id,
      username: fakerEn.internet.userName(),
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: fakerVi.date.between('1950-01-01', new Date()),
      gender: gender,
      bio: fakerEn.lorem.paragraphs(),
      phoneNumber: fakerVi.phone.number('+84#########'),
      createdAt: createdAt,
      updatedAt: updatedAt,
      locationId: locations[i].id,
      avatarId: null,
    };
  });

  const profileInterestedSkills: ProfileInterestedSkill[] = [
    ...profiles.flatMap((profile) =>
      _.sampleSize(skills, randomInt(0, 3)).map((skill) => ({
        profileId: profile.accountId,
        skillId: skill.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ),
  ];

  await prisma.location.createMany({
    data: locations,
  });

  await prisma.profile.createMany({
    data: profiles,
  });

  await prisma.profileInterestedSkill.createMany({
    data: profileInterestedSkills,
  });

  return {
    locations,
    profiles,
    profileInterestedSkills,
  };
};

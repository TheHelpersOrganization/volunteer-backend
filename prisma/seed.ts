import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import {
  Account,
  AccountRole,
  Location,
  PrismaClient,
  Profile,
  Role,
} from '@prisma/client';
import { randomInt } from 'crypto';
import * as _ from 'lodash';
import { Role as RoleEnum } from '../src/auth/constants';
import { Gender } from '../src/profile/constants';
import { generateViName } from './utils';

fakerVi.seed(1);

const roles: Role[] = [
  {
    id: 1,
    name: RoleEnum.Volunteer,
    description: 'Volunteer',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: RoleEnum.Moderator,
    description: 'Moderator',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: RoleEnum.Admin,
    description: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: RoleEnum.Operator,
    description: 'Operator',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const getRoleByName = (name: RoleEnum) => {
  const role = roles.find((role) => role.name === name);
  if (!role) {
    throw new Error('Role not found');
  }
  return role;
};

const accounts: Account[] = [
  {
    id: 1,
    email: 'hquan310@gmail.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: 'op@a.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    email: 'mod@a.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    email: 'admin@a.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    email: 'a@a.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    email: 'b@b.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    email: 'c@c.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    email: 'd@d.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9,
    email: 'e@e.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    email: 'f@f.com',
    password: '123456',
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ...Array.from({ length: 20 }).map((_, i) => {
    const createdAt = fakerVi.date.between('2018-01-01', new Date());
    const updatedAt = fakerVi.date.between(createdAt, new Date());

    return {
      id: i + 11,
      email: fakerVi.internet.exampleEmail(),
      password: '123456',
      isAccountVerified: randomInt(0, 2) === 1,
      isAccountDisabled: randomInt(0, 2) === 1,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  }),
];

const accountRoles: AccountRole[] = [
  {
    accountId: 1,
    roleId: getRoleByName(RoleEnum.Operator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    accountId: 1,
    roleId: getRoleByName(RoleEnum.Admin).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    accountId: 1,
    roleId: getRoleByName(RoleEnum.Moderator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    accountId: 2,
    roleId: getRoleByName(RoleEnum.Operator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    accountId: 3,
    roleId: getRoleByName(RoleEnum.Moderator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    accountId: 4,
    roleId: getRoleByName(RoleEnum.Admin).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
accounts.forEach((account) => {
  accountRoles.push({
    accountId: account.id,
    roleId: getRoleByName(RoleEnum.Volunteer).id,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  });
});

const locations: Location[] = Array.from({ length: accounts.length }).map(
  (_, i) => {
    return {
      id: i + 1,
      addressLine1: fakerVi.address.streetAddress(false),
      addressLine2: fakerVi.address.secondaryAddress(),
      locality: fakerVi.address.street(),
      region: fakerVi.address.cityName(),
      country: 'VN',
      latitude: Number.parseFloat(fakerVi.address.latitude()),
      longitude: Number.parseFloat(fakerVi.address.longitude()),
      createdAt: accounts[i].createdAt,
      updatedAt: accounts[i].updatedAt,
    };
  },
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

const prisma = new PrismaClient();

async function main() {
  // await prisma.role.createMany({
  //   data: roles,
  // });

  // await prisma.account.createMany({
  //   data: [...accounts].map((account) => ({ ...account, roles: undefined })),
  // });

  // await prisma.accountRole.createMany({
  //   data: accountRoles,
  // });

  // await prisma.location.createMany({
  //   data: locations,
  // });

  // await prisma.profile.createMany({
  //   data: profiles,
  // });

  console.log(profiles);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

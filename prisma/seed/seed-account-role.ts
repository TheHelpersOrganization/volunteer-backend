import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import { Account, AccountRole, PrismaClient, Role } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { Role as RoleEnum } from '../../src/auth/constants';

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

const hashedPassword = hashSync('123456', 10);

const opAccounts = Array.from({ length: 5 }).map((_, index) => ({
  id: 2 + index,
  email: `op${index}@a.com`,
  password: hashedPassword,
  isAccountVerified: false,
  isAccountDisabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const modAccounts = Array.from({ length: 30 }).map((_, index) => ({
  id: 100 + index,
  email: `mod${index}@a.com`,
  password: hashedPassword,
  isAccountVerified: false,
  isAccountDisabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const adminAccounts = Array.from({ length: 30 }).map((_, index) => ({
  id: 200 + index,
  email: `admin${index}@a.com`,
  password: hashedPassword,
  isAccountVerified: false,
  isAccountDisabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const volunteerAccounts = Array.from({ length: 30 }).map((_, i) => {
  const createdAt = fakerVi.date.between('2018-01-01', new Date());
  const updatedAt = fakerVi.date.between(createdAt, new Date());

  return {
    id: 300 + i,
    email: fakerVi.internet.exampleEmail(),
    password: hashedPassword,
    isAccountVerified: fakerVi.datatype.boolean(),
    isAccountDisabled: fakerVi.datatype.boolean(),
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
});

const accounts: Account[] = [
  {
    id: 1,
    email: 'hquan310@gmail.com',
    password: hashedPassword,
    isAccountVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ...opAccounts,
  ...modAccounts,
  ...adminAccounts,
  ...volunteerAccounts,
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
  ...opAccounts.map((account) => ({
    accountId: account.id,
    roleId: getRoleByName(RoleEnum.Operator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  ...modAccounts.map((account) => ({
    accountId: account.id,
    roleId: getRoleByName(RoleEnum.Moderator).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  ...adminAccounts.map((account) => ({
    accountId: account.id,
    roleId: getRoleByName(RoleEnum.Admin).id,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
];
accounts.forEach((account) => {
  accountRoles.push({
    accountId: account.id,
    roleId: getRoleByName(RoleEnum.Volunteer).id,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  });
});

export const seedAccountsAndRoles = async (prisma: PrismaClient) => {
  await prisma.role.createMany({
    data: roles,
  });

  await prisma.account.createMany({
    data: accounts,
  });

  await prisma.accountRole.createMany({
    data: accountRoles,
  });

  return {
    roles,
    accountRoles,
    adminAccounts,
    modAccounts,
    volunteerAccounts,
    accounts,
  };
};

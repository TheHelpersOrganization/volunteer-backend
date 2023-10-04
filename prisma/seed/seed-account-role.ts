import { AccountVerificationStatus } from '@app/account-verification/constants';
import { OrganizationMemberRole } from '@app/organization/constants';
import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import {
  Account,
  AccountBan,
  AccountRole,
  AccountVerification,
  PrismaClient,
  Role,
} from '@prisma/client';
import { hashSync } from 'bcrypt';
import { Role as RoleEnum } from '../../src/auth/constants';
import {
  getNextAccountBanId,
  getNextAccountId,
  getNextAccountVerificationId,
  getNextRoleId,
} from './utils';

export class SeedAccountsAndRolesOptions {
  defaultAccountOptions?: {
    include?: boolean;
    roles?: RoleEnum[];
  };
  numberOfOpAccounts?: number;
  numberOfModAccounts?: number;
  numberOfAdminAccounts?: number;
  numberOfVolunteerAccounts?: number;
  runWithoutDb?: boolean;
}

export const seedAccountsAndRoles = async (
  prisma: PrismaClient,
  options?: SeedAccountsAndRolesOptions,
) => {
  const roles: Role[] = [
    {
      id: getNextRoleId(),
      name: RoleEnum.Volunteer,
      displayName: 'Volunteer',
      description: 'Volunteer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Moderator,
      displayName: 'Moderator',
      description: 'Moderator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Admin,
      displayName: 'Admin',
      description: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.SuperAdmin,
      displayName: 'Super Admin',
      description: 'Super Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: RoleEnum.Operator,
      displayName: 'Operator',
      description: 'Operator',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const organizationMemberRoles: Role[] = [
    {
      id: getNextRoleId(),
      name: OrganizationMemberRole.Owner,
      displayName: 'Owner',
      description:
        'Organization owner can update, delete organization and transfer organization ownership. Plus all the permissions of other roles',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: OrganizationMemberRole.Manager,
      displayName: 'Manager',
      description:
        'Organization Manager can update organization. Plus all the permissions of Member Manager and Activity Manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: OrganizationMemberRole.MemberManager,
      displayName: 'Member Manager',
      description:
        'Organization Member Manager can manage organization member. Plus all the permissions of Activity Manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: getNextRoleId(),
      name: OrganizationMemberRole.ActivityManager,
      displayName: 'Activity Manager',
      description:
        'Organization Activity Manager can create, update and delete organization activity',
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

  const defaultAccounts: Account[] = [];
  if (options?.defaultAccountOptions?.include === true) {
    const acc1: Account = {
      id: getNextAccountId(),
      email: 'hquan310@gmail.com',
      password: hashedPassword,
      isAccountVerified: false,
      isEmailVerified: false,
      isAccountDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    defaultAccounts.push(acc1);
  }

  const opAccounts = Array.from({
    length: options?.numberOfOpAccounts ?? 10,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `op${index}@thehelpers.me`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: false,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const modAccounts = Array.from({
    length: options?.numberOfModAccounts ?? 80,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `mod${index}@thehelpers.me`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: true,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const adminAccounts = Array.from({
    length: options?.numberOfAdminAccounts ?? 30,
  }).map((_, index) => ({
    id: getNextAccountId(),
    email: `admin${index}@a.com`,
    password: hashedPassword,
    isAccountVerified: false,
    isEmailVerified: true,
    isAccountDisabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const verificationList: AccountVerification[] = [];
  const banList: AccountBan[] = [];

  const noteTemplatesOk = [
    'Account verified',
    'Information verified',
    'Profile verified',
  ];
  const noteTemplatesNotOk = [
    'Wrong information',
    'Please check your email again',
    'Profile contains inappropriate content',
    'Profile contains inappropriate image',
  ];
  const banNoteTemplates = [
    'Banned for inappropriate content',
    'Banned for inappropriate image',
    'Banned for inappropriate behavior',
    'Banned for inappropriate language',
    'Harassment',
    'Spam',
    'Scam',
  ];

  const volunteerAccounts = Array.from({
    length: options?.numberOfVolunteerAccounts ?? 300,
  }).map(() => {
    const accountId = getNextAccountId();

    const createdAt = fakerVi.date.between({
      from: '2018-01-01',
      to: new Date(),
    });
    const updatedAt = fakerVi.date.between({ from: createdAt, to: new Date() });

    const isAccountVerified = fakerVi.datatype.boolean();
    const isAccountDisabled = fakerVi.datatype.boolean();

    let ca: Date;
    // Has no pending verification
    if (isAccountVerified && fakerVi.datatype.boolean()) {
      // Random number of verification
      for (let i = 0; i < fakerVi.number.int({ min: 0, max: 3 }); i++) {
        const ca = fakerVi.date.soon({ days: 14, refDate: createdAt });
        const isVerified = fakerVi.datatype.boolean();

        const note = isVerified
          ? fakerVi.helpers.arrayElement(noteTemplatesOk)
          : fakerVi.helpers.arrayElement(noteTemplatesNotOk);
        verificationList.push({
          id: getNextAccountVerificationId(),
          accountId: accountId,
          performedBy: fakerVi.helpers.arrayElement(adminAccounts).id,
          note: note,
          isVerified: isVerified,
          status: AccountVerificationStatus.Completed,
          content: 'I want to verify my account',
          createdAt: ca,
          updatedAt: ca,
        });
      }

      // The last verification must match the account verification status
      ca = fakerVi.date.soon({ days: 14, refDate: createdAt });
      const note = isAccountVerified
        ? fakerVi.helpers.arrayElement(noteTemplatesOk)
        : fakerVi.helpers.arrayElement(noteTemplatesNotOk);
      verificationList.push({
        id: getNextAccountVerificationId(),
        accountId: accountId,
        performedBy: fakerVi.helpers.arrayElement(adminAccounts).id,
        note: note,
        isVerified: isAccountVerified,
        status: AccountVerificationStatus.Completed,
        content: 'I want to verify my account',
        createdAt: ca,
        updatedAt: ca,
      });
    } else {
      // Has pending verification
      ca = fakerVi.date.soon({ days: 14, refDate: createdAt });
      verificationList.push({
        id: getNextAccountVerificationId(),
        accountId: accountId,
        performedBy: fakerVi.helpers.arrayElement(adminAccounts).id,
        note: null,
        isVerified: false,
        status: AccountVerificationStatus.Pending,
        content: 'I want to verify my account',
        createdAt: ca,
        updatedAt: ca,
      });
    }

    // Random number of ban
    if (isAccountDisabled) {
      for (let i = 0; i < fakerVi.number.int({ min: 0, max: 3 }); i++) {
        const ca = fakerVi.date.soon({ days: 14, refDate: createdAt });
        banList.push({
          id: getNextAccountBanId(),
          accountId: accountId,
          performedBy: fakerVi.helpers.arrayElement(adminAccounts).id,
          note: fakerEn.helpers.arrayElement(banNoteTemplates),
          isBanned: fakerVi.datatype.boolean(),
          createdAt: ca,
          updatedAt: ca,
        });
      }

      ca = fakerVi.date.soon({ days: 14, refDate: createdAt });
      banList.push({
        id: getNextAccountBanId(),
        accountId: accountId,
        performedBy: fakerVi.helpers.arrayElement(adminAccounts).id,
        note: fakerEn.helpers.arrayElement(banNoteTemplates),
        isBanned: isAccountDisabled,
        createdAt: ca,
        updatedAt: ca,
      });
    }

    return {
      id: accountId,
      email: `volunteer${accountId}@thehelpers.me`,
      password: hashedPassword,
      isEmailVerified: fakerVi.datatype.boolean(),
      isAccountVerified: fakerVi.datatype.boolean(),
      isAccountDisabled: fakerVi.datatype.boolean(),
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  });

  const accounts: Account[] = [
    ...opAccounts,
    ...modAccounts,
    ...adminAccounts,
    ...volunteerAccounts,
    ...defaultAccounts,
  ];

  const defaultAccountRoles: AccountRole[] = defaultAccounts.flatMap(
    (account) =>
      (
        options?.defaultAccountOptions?.roles ?? [
          RoleEnum.Operator,
          RoleEnum.Admin,
          RoleEnum.Moderator,
        ]
      ).map((role) => ({
        accountId: account.id,
        roleId: getRoleByName(role).id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
  );

  const accountRoles: AccountRole[] = [
    ...defaultAccountRoles,
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

  const nonDisabledAccounts = accounts.filter(
    (account) => !account.isAccountDisabled,
  );
  const nonDisabledModAccounts = modAccounts.filter(
    (account) => !account.isAccountDisabled,
  );
  const nonDisabledVolunteerAccounts = volunteerAccounts.filter(
    (account) => !account.isAccountDisabled,
  );

  if (options?.runWithoutDb) {
    return {
      roles,
      accountRoles,
      adminAccounts,
      modAccounts,
      volunteerAccounts,
      defaultAccounts,
      accounts,
      organizationMemberRoles,
    };
  }

  await prisma.role.createMany({
    data: [...roles, ...organizationMemberRoles],
  });

  await prisma.account.createMany({
    data: accounts,
  });

  await prisma.accountRole.createMany({
    data: accountRoles,
  });

  await prisma.accountVerification.createMany({
    data: verificationList,
  });

  await prisma.accountBan.createMany({
    data: banList,
  });

  return {
    roles,
    accountRoles,
    organizationMemberRoles,
    adminAccounts,
    modAccounts,
    volunteerAccounts,
    nonDisabledAccounts,
    nonDisabledModAccounts,
    nonDisabledVolunteerAccounts,
    defaultAccounts,
    accounts,
  };
};

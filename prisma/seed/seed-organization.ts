import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import {
  Account,
  Contact,
  Location,
  Member,
  MemberRole,
  Organization,
  OrganizationContact,
  OrganizationFile,
  OrganizationLocation,
  OrganizationSkill,
  PrismaClient,
  Role,
} from '@prisma/client';
import { randomInt } from 'crypto';
import { readFileSync } from 'fs';
import _ from 'lodash';
import path from 'path';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationStatus,
} from '../../src/organization/constants';
import { seedFiles } from './seed-file';
import { skills } from './seed-skill';
import {
  generateLocation,
  generateMember,
  generateMemberRole,
  getNextMemberId,
  getNextOrganizationId,
  getOrganizationMemberRoleByName,
  getOrganizationRoleNameById,
} from './utils';

export const seedOrganizations = async (
  prisma: PrismaClient,
  accounts: Account[],
  adminAccounts: Account[],
  modAccounts: Account[],
  volunteerAccounts: Account[],
  roles: Role[],
  contacts: Contact[],
  options?: {
    runWithoutDb?: boolean;
    numberOfOrganizationsPerMod?: number;
  },
) => {
  const account1OrganizationTemplate = [
    OrganizationStatus.Verified,
    ...Object.values(OrganizationStatus),
  ];
  const modOrganizationTemplate = modAccounts.flatMap((account) =>
    _.sampleSize(
      [OrganizationStatus.Verified, ...Object.values(OrganizationStatus)],
      randomInt(0, Object.values(OrganizationStatus).length) + 1,
    ).map((value) => ({ account, organizationStatus: value })),
  );
  const organizationCount =
    account1OrganizationTemplate.length + modAccounts.length;

  const organizationContactIds: number[] = [];
  const organizationContactsRel: OrganizationContact[] = [];

  const hasLogo: boolean[] = [];
  const organizationTemplate = loadOrganizations();
  const verifierCommentTemplate = [
    'Your organization is verified',
    'Your organization information is verified',
    'Your organization is verified. Thank you for joining us!',
    'Your organization is verified. Welcome to The Helpers!',
    'Your organization is verified. We hope you enjoy your stay!',
  ];

  for (let i = 0; i < organizationCount; i++) {
    const v = fakerEn.helpers.weightedArrayElement([
      { weight: 3, value: true },
      { weight: 1, value: false },
    ]);
    hasLogo.push(v);
  }

  const organizationLogos = await seedFiles(
    prisma,
    './tmp/images/organization-logo',
    hasLogo.length,
    () =>
      fakerEn.image.urlLoremFlickr({
        width: 128,
        height: 128,
        category: 'logo',
      }),
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );

  const organizationBanner = await seedFiles(
    prisma,
    './tmp/images/organization-banner',
    hasLogo.length,
    () =>
      fakerEn.image.urlLoremFlickr({
        width: 1280,
        height: 720,
        category: 'background',
      }),
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );

  let logoIndex = 0;

  const organizations: Organization[] = [
    ...account1OrganizationTemplate.map((value, index) => {
      const res = {
        id: getNextOrganizationId(),
        name: `The Helpers${index === 0 ? '' : ` ${index}`}`,
        phoneNumber: fakerVi.phone.number(),
        //phoneNumber: fakerVi.phone.number('+84#########'),
        email: fakerVi.internet.exampleEmail(),
        description:
          organizationTemplate[index % organizationTemplate.length].bio,
        website: fakerVi.internet.url(),
        status: value,
        isDisabled: false,
        disabledBy: null,
        logo: hasLogo[index] ? organizationLogos[logoIndex]?.id ?? null : null,
        banner: hasLogo[index]
          ? organizationBanner[logoIndex]?.id ?? null
          : null,
        ownerId: 1,
        verifierId: _.sample(adminAccounts)?.id ?? adminAccounts[0].id,
        verifierComment: 'Your organization is verified',
        createdAt: fakerVi.date.between({ from: '2000-01-01', to: new Date() }),
        updatedAt: new Date(),
        hoursContributed: 0,
      };
      if (hasLogo[index]) {
        logoIndex++;
      }
      return res;
    }),
    ...modOrganizationTemplate.map((value, index) => {
      const realIndex = index + account1OrganizationTemplate.length;

      const res = {
        id: getNextOrganizationId(),
        name: fakerEn.company.name(),
        phoneNumber: fakerVi.phone.number(),
        email: fakerEn.internet.exampleEmail(),
        description:
          organizationTemplate[realIndex % organizationTemplate.length].bio,
        website: fakerVi.internet.url(),
        status: value.organizationStatus,
        isDisabled: fakerVi.datatype.boolean(),
        disabledBy: _.sample(adminAccounts)?.id ?? null,
        logo: hasLogo[realIndex]
          ? organizationLogos[logoIndex]?.id ?? null
          : null,
        banner: hasLogo[realIndex]
          ? organizationBanner[logoIndex]?.id ?? null
          : null,
        ownerId: value.account.id,
        verifierId: _.sample(adminAccounts)?.id ?? adminAccounts[0].id,
        verifierComment: _.sample(verifierCommentTemplate) ?? null,
        createdAt: fakerVi.date.between({ from: '1950-01-01', to: new Date() }),
        updatedAt: new Date(),
        hoursContributed: 0,
      };

      if (hasLogo[realIndex]) {
        logoIndex++;
      }

      return res;
    }),
  ];

  const organizationLocations: Location[] = Array.from({
    length: organizations.length * 2,
  }).map(() => generateLocation());

  const organizationLocationsRel: OrganizationLocation[] = [];
  organizations.forEach((organization, i) => {
    organizationLocationsRel.push({
      organizationId: organization.id,
      locationId: organizationLocations[i * 2].id,
    });
    organizationLocationsRel.push({
      organizationId: organization.id,
      locationId: organizationLocations[i * 2 + 1].id,
    });
  });

  // const organizationContacts: Contact[] = Array.from({
  //   length: organizations.length,
  // }).map(() => ({
  //   id: getNextContactId(),
  //   name: fakerVi.person.fullName(),
  //   email: fakerVi.internet.exampleEmail(),
  //   phoneNumber: fakerVi.phone.number('+84#########'),
  // }));

  const organizationSkills: OrganizationSkill[] = organizations.flatMap(
    (organization) =>
      _.sampleSize(skills, randomInt(0, 3)).map((skill) => ({
        organizationId: organization.id,
        skillId: skill.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
  );

  const organizationFileCount = organizations.map((organization) => ({
    organizationId: organization.id,
    fileCount: randomInt(0, 3),
  }));
  const organizationFiles = await seedFiles(
    prisma,
    './tmp/images/organization-file',
    organizationFileCount.reduce((acc, cur) => acc + cur.fileCount, 0),
    () =>
      fakerEn.image.urlLoremFlickr({
        width: 128,
        height: 128,
      }),
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );
  let organizationFileIndex = 0;
  const organizationFileRel: OrganizationFile[] = [];
  organizationFileCount.forEach((ofc) => {
    for (let j = 0; j < ofc.fileCount; j++) {
      const fileId = organizationFiles[organizationFileIndex]?.id;
      if (fileId == null) {
        organizationFileIndex++;
        continue;
      }
      organizationFileRel.push({
        organizationId: ofc.organizationId,
        fileId: fileId,
      });
      organizationFileIndex++;
    }
  });

  const memberRoles: MemberRole[] = [];
  const members: Member[] = organizations.flatMap((organization) => {
    const memberMappings: Member[] = [];
    const memberId = getNextMemberId();

    memberMappings.push({
      id: memberId,
      status: OrganizationMemberStatus.Approved,
      censorId: null,
      rejectionReason: null,
      accountId: organization.ownerId,
      organizationId: organization.id,
      createdAt: organization.createdAt,
      updatedAt: new Date(),
    });

    memberRoles.push({
      memberId: memberId,
      roleId: getOrganizationMemberRoleByName(
        roles,
        OrganizationMemberRole.Owner,
      ).id,
      grantedBy: null,
      createdAt: organization.createdAt,
      updatedAt: new Date(),
    });

    if (organization.status !== OrganizationStatus.Verified) {
      return memberMappings;
    }

    _.sampleSize(
      volunteerAccounts,
      randomInt(0, Math.max(volunteerAccounts.length, 5)),
    ).forEach((account) =>
      memberMappings.push(generateMember(account, organization)),
    );

    _.sampleSize(
      memberMappings,
      randomInt(0, Math.max(memberMappings.length, 15)),
    ).forEach((member) => {
      const role = generateMemberRole(member, roles, accounts);
      if (
        getOrganizationRoleNameById(roles, role.roleId) ==
        OrganizationMemberRole.Manager
      ) {
        const accountContacts = _.sampleSize(
          contacts.filter((c) => c.accountId === member.accountId),
          randomInt(0, 2),
        );
        organizationContactIds.push(...accountContacts.map((c) => c.id));
        organizationContactsRel.push(
          ...accountContacts.map((c) => ({
            organizationId: organization.id,
            contactId: c.id,
          })),
        );
      }

      return memberRoles.push(role);
    });

    return memberMappings;
  });

  organizations
    .filter((o) => o.ownerId !== 1 && o.status === OrganizationStatus.Verified)
    .forEach((organization) => {
      members.push(generateMember(accounts[0], organization));
    });

  if (options?.runWithoutDb) {
    return {
      organizations,
      organizationLocations,
      organizationLocationsRel,
      organizationContactsRel,
      organizationSkills,
      members,
    };
  }

  await prisma.organization.createMany({
    data: organizations,
  });

  await prisma.location.createMany({
    data: organizationLocations,
  });

  // await prisma.contact.createMany({
  //   data: organizationContacts,
  // });

  await prisma.organizationLocation.createMany({
    data: organizationLocationsRel,
  });

  await prisma.organizationContact.createMany({
    data: organizationContactsRel,
  });

  await prisma.organizationSkill.createMany({
    data: organizationSkills,
  });

  await prisma.organizationFile.createMany({
    data: organizationFileRel,
  });

  await prisma.member.createMany({
    data: members,
  });

  await prisma.memberRole.createMany({
    data: memberRoles,
  });

  return {
    organizations,
    organizationLocations,
    organizationLocationsRel,
    organizationContactsRel,
    organizationSkills,
    members,
  };
};

class OrganizationTemplate {
  bio: string;
}

const loadOrganizations = () => {
  const lines = readFileSync(
    path.join(__dirname, `./assets/organization-bio.txt`),
    'utf-8',
  ).split('\n');
  const organizationTemplates: OrganizationTemplate[] = [];

  lines.forEach((line) => {
    if (line.trim().length === 0) {
      return;
    }
    const organizationTemplate = new OrganizationTemplate();
    organizationTemplate.bio = line;
    organizationTemplates.push(organizationTemplate);
  });

  return organizationTemplates;
};

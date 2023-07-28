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
import * as _ from 'lodash';
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
  getNextContactId,
  getNextMemberId,
  getNextOrganizationId,
  getOrganizationMemberRoleByName,
} from './utils';

export const seedOrganizations = async (
  prisma: PrismaClient,
  accounts: Account[],
  adminAccounts: Account[],
  modAccounts: Account[],
  volunteerAccounts: Account[],
  roles: Role[],
  options?: {
    runWithoutDb?: boolean;
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

  const hasLogo: boolean[] = [];

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
      runWithoutDb: options?.runWithoutDb,
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
      runWithoutDb: options?.runWithoutDb,
    },
  );

  let logoIndex = 0;

  const organizations: Organization[] = [
    ...account1OrganizationTemplate.map((value, index) => {
      const res = {
        id: getNextOrganizationId(),
        name: `The Helpers ${index === 0 ? '' : index}`,
        phoneNumber: fakerVi.phone.number('+84#########'),
        email: fakerVi.internet.exampleEmail(),
        description: fakerEn.lorem.paragraphs(),
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
        verifierComment: fakerEn.lorem.sentence(),
        createdAt: fakerVi.date.between({ from: '1950-01-01', to: new Date() }),
        updatedAt: new Date(),
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
        phoneNumber: fakerVi.phone.number('+84#########'),
        email: fakerEn.internet.exampleEmail(),
        description: fakerEn.lorem.paragraphs(),
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
        verifierComment: fakerEn.lorem.sentence(),
        createdAt: fakerVi.date.between({ from: '1950-01-01', to: new Date() }),
        updatedAt: new Date(),
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

  const organizationContacts: Contact[] = Array.from({
    length: organizations.length,
  }).map(() => ({
    id: getNextContactId(),
    name: fakerVi.person.fullName(),
    email: fakerVi.internet.exampleEmail(),
    phoneNumber: fakerVi.phone.number('+84#########'),
  }));

  const organizationContactsRel: OrganizationContact[] =
    organizationContacts.map((contact, i) => ({
      organizationId: organizations[i].id,
      contactId: contact.id,
    }));

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
      runWithoutDb: options?.runWithoutDb,
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
    ).forEach((member) =>
      memberRoles.push(generateMemberRole(member, roles, accounts)),
    );

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
      organizationContacts,
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

  await prisma.contact.createMany({
    data: organizationContacts,
  });

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
    organizationContacts,
    organizationContactsRel,
    organizationSkills,
    members,
  };
};

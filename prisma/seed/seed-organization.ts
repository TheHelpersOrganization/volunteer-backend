import { faker as fakerEn } from '@faker-js/faker/locale/en';
import { faker as fakerVi } from '@faker-js/faker/locale/vi';
import {
  Account,
  Contact,
  Location,
  Member,
  Organization,
  OrganizationContact,
  OrganizationLocation,
  OrganizationSkill,
  PrismaClient,
} from '@prisma/client';
import { randomInt } from 'crypto';
import * as _ from 'lodash';
import {
  OrganizationMemberStatus,
  OrganizationStatus,
} from '../../src/organization/constants';
import { skills } from './seed-skill';
import {
  generateMember,
  generateViLocation,
  getNextContactId,
  getNextMemberId,
  getNextOrganizationId,
} from './utils';

export const seedOrganizations = async (
  prisma: PrismaClient,
  accounts: Account[],
  adminAccounts: Account[],
  modAccounts: Account[],
  volunteerAccounts: Account[],
) => {
  const organizations: Organization[] = [
    ...[OrganizationStatus.Verified, ...Object.values(OrganizationStatus)].map(
      (value, index) => ({
        id: getNextOrganizationId(),
        name: `The Helpers ${index === 0 ? '' : index}`,
        phoneNumber: fakerVi.phone.number('+84#########'),
        email: fakerVi.internet.exampleEmail(),
        description: fakerEn.lorem.paragraphs(),
        website: fakerVi.internet.url(),
        status: value,
        isDisabled: false,
        logo: null,
        banner: null,
        ownerId: 1,
        verifierId: _.sample(adminAccounts)?.id ?? adminAccounts[0].id,
        verifierComment: fakerEn.lorem.sentence(),
        createdAt: fakerVi.date.between('1950-01-01', new Date()),
        updatedAt: new Date(),
      }),
    ),
    ...modAccounts.flatMap((account) =>
      _.sampleSize(
        [OrganizationStatus.Verified, ...Object.values(OrganizationStatus)],
        randomInt(0, Object.values(OrganizationStatus).length) + 1,
      ).map((value) => {
        return {
          id: getNextOrganizationId(),
          name: fakerEn.company.name(),
          phoneNumber: fakerVi.phone.number('+84#########'),
          email: fakerEn.internet.exampleEmail(),
          description: fakerEn.lorem.paragraphs(),
          website: fakerVi.internet.url(),
          status: value,
          isDisabled: fakerVi.datatype.boolean(),
          logo: null,
          banner: null,
          ownerId: account.id,
          verifierId: _.sample(adminAccounts)?.id ?? adminAccounts[0].id,
          verifierComment: fakerEn.lorem.sentence(),
          createdAt: fakerVi.date.between('1950-01-01', new Date()),
          updatedAt: new Date(),
        };
      }),
    ),
  ];

  const organizationLocations: Location[] = Array.from({
    length: organizations.length * 2,
  }).map(() => generateViLocation());

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
    name: fakerVi.name.fullName(),
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

  const members: Member[] = organizations.flatMap((organization) => {
    const memberMappings: Member[] = [];

    memberMappings.push({
      id: getNextMemberId(),
      status: OrganizationMemberStatus.Approved,
      censorId: null,
      rejectionReason: null,
      accountId: organization.ownerId,
      organizationId: organization.id,
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

    return memberMappings;
  });
  organizations
    .filter((o) => o.ownerId !== 1 && o.status === OrganizationStatus.Verified)
    .forEach((organization) => {
      members.push(generateMember(accounts[0], organization));
    });

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

  await prisma.member.createMany({
    data: members,
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

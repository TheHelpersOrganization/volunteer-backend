import { faker as fakerEn } from '@faker-js/faker/locale/en';
import {
  Account,
  Activity,
  ActivityContact,
  Contact,
  Location,
  Organization,
  PrismaClient,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftSkill,
  Skill,
  VolunteerShift,
} from '@prisma/client';
import * as _ from 'lodash';
import { ActivityStatus } from 'src/activity/constants';
import { OrganizationStatus } from '../../src/organization/constants';
import { ShiftVolunteerStatus } from '../../src/shift/constants';
import { seedFiles } from './seed-file';
import {
  capitalizeWords,
  generateViContact,
  generateViLocation,
  getNextActivityId,
  getNextShiftId,
  getNextShiftVolunteerId,
} from './utils';

export const seedActivities = async (
  prisma: PrismaClient,
  organizations: Organization[],
  skills: Skill[],
  volunteerAccounts: Account[],
  defaultAccounts: Account[],
) => {
  const activities: Activity[] = [];
  const activityContacts: Contact[] = [];
  const activityContactRels: ActivityContact[] = [];

  organizations
    .filter((o) => o.status === OrganizationStatus.Verified)
    .forEach((organization) => {
      activities.push({
        id: getNextActivityId(),
        isDisabled: false,
        status: ActivityStatus.Pending,
        organizationId: organization.id,
        name: capitalizeWords(fakerEn.lorem.words()),
        description: fakerEn.lorem.paragraphs(),
        thumbnail: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      Object.values(ActivityStatus).forEach((status) => {
        for (let i = 0; i < fakerEn.number.int({ min: 2, max: 5 }); i++) {
          activities.push({
            id: getNextActivityId(),
            isDisabled: fakerEn.datatype.boolean(),
            status: status,
            organizationId: organization.id,
            name: capitalizeWords(fakerEn.lorem.words()),
            description: fakerEn.lorem.paragraphs(),
            thumbnail: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });
    });

  const thumbnails = await seedFiles(
    prisma,
    './tmp/images/activity-thumbnail',
    activities.length,
    () =>
      fakerEn.image.urlLoremFlickr({
        width: 1280,
        height: 720,
        category: 'volunteer',
      }),
  );
  activities.forEach((activity, index) => {
    activity.thumbnail = thumbnails[index]?.id ?? null;
    const ac: Contact[] = Array.from({
      length: fakerEn.number.int({ min: 1, max: 5 }),
    }).map(() => generateViContact());
    activityContacts.push(...ac);
    activityContactRels.push(
      ...ac.map((contact) => ({
        activityId: activity.id,
        contactId: contact.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  });

  const shifts: Shift[] = [];
  const shiftLocations: Location[] = [];
  const shiftLocationsRel: ShiftLocation[] = [];
  const shiftContacts: Contact[] = [];
  const shiftContactsRel: ShiftContact[] = [];
  const shiftSkills: ShiftSkill[] = [];
  const shiftVolunteers: VolunteerShift[] = [];

  activities.forEach((activity) => {
    const startTime = fakerEn.date.future();
    for (let i = 0; i < fakerEn.number.int({ min: 0, max: 5 }); i++) {
      const shiftId = getNextShiftId();

      shifts.push({
        id: shiftId,
        name: capitalizeWords(fakerEn.lorem.words()),
        description: fakerEn.lorem.paragraphs(),
        startTime: startTime,
        endTime: fakerEn.date.future({ years: 1, refDate: startTime }),
        numberOfParticipants: fakerEn.number.int({ min: 0, max: 100 }),
        activityId: activity.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (let j = 0; j < fakerEn.number.int({ min: 1, max: 3 }); j++) {
        const location = generateViLocation();
        shiftLocations.push(location);
        shiftLocationsRel.push({
          shiftId: shiftId,
          locationId: location.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      for (let j = 0; j < fakerEn.number.int({ min: 1, max: 3 }); j++) {
        const contact = generateViContact();
        shiftContacts.push(contact);
        shiftContactsRel.push({
          shiftId: shiftId,
          contactId: contact.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      _.sampleSize(
        skills,
        fakerEn.number.int({ min: 1, max: skills.length }),
      ).forEach((skill) => {
        shiftSkills.push({
          shiftId: shiftId,
          skillId: skill.id,
          hours: fakerEn.number.float({
            min: 0.5,
            max: 12,
            precision: 0.5,
          }),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      _.sampleSize(
        [...volunteerAccounts, ...defaultAccounts],
        fakerEn.number.int({ min: 0, max: 20 }),
      ).forEach((account) => {
        const status =
          _.sample(Object.values(ShiftVolunteerStatus)) ??
          ShiftVolunteerStatus.Approved;
        shiftVolunteers.push({
          id: getNextShiftVolunteerId(),
          shiftId: shiftId,
          status: status,
          attendant: false,
          completion:
            status === ShiftVolunteerStatus.Approved
              ? fakerEn.number.float({ min: 0, max: 100 })
              : 0,
          accountId: account.id,
          censorId: [
            ShiftVolunteerStatus.Pending,
            ShiftVolunteerStatus.Cancelled,
          ].includes(status)
            ? null
            : organizations.find((o) => o.id === activity.organizationId)
                ?.ownerId ?? null,
          rejectionReason: [
            ShiftVolunteerStatus.Rejected,
            ShiftVolunteerStatus.Removed,
          ].includes(status)
            ? fakerEn.lorem.sentence()
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }
  });

  await prisma.activity.createMany({
    data: activities,
  });

  await prisma.contact.createMany({
    data: activityContacts,
  });

  await prisma.activityContact.createMany({
    data: activityContactRels,
  });

  await prisma.shift.createMany({
    data: shifts,
  });

  await prisma.location.createMany({
    data: shiftLocations,
  });

  await prisma.shiftLocation.createMany({
    data: shiftLocationsRel,
  });

  await prisma.contact.createMany({
    data: shiftContacts,
  });

  await prisma.shiftContact.createMany({
    data: shiftContactsRel,
  });

  await prisma.shiftSkill.createMany({
    data: shiftSkills,
  });

  await prisma.volunteerShift.createMany({
    data: shiftVolunteers,
  });

  return {
    activities: activities,
    shifts,
    shiftVolunteers,
  };
};

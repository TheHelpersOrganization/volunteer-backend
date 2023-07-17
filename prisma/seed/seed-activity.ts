import { faker as fakerEn } from '@faker-js/faker/locale/en';
import {
  Account,
  Activity,
  ActivityContact,
  ActivityLocation,
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
import * as dayjs from 'dayjs';
import * as _ from 'lodash';
import { ActivityStatus } from 'src/activity/constants';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import { ShiftStatus } from 'src/shift/constants';
import { OrganizationStatus } from '../../src/organization/constants';
import { seedFiles } from './seed-file';
import {
  capitalizeWords,
  generateLocation,
  generateViContact,
  getNextActivityId,
  getNextShiftId,
  getNextShiftVolunteerId,
  requireNonNullish,
} from './utils';

const weightedNumberOfParticipants = Array.from({ length: 30 }).map((_, i) => ({
  weight: 30 / (i + 1),
  value: i + 5,
}));
const weightedShiftTimeRange = Array.from({ length: 30 }).map((_, i) => ({
  value: (i + 1) * 0.0001,
  weight: 30 / (i + 1),
}));
const weightedNumberOfShifts = Array.from({ length: 10 }).map((_, i) => ({
  value: i + 1,
  weight: 1 / (i + 1),
}));

export const seedActivities = async (
  prisma: PrismaClient,
  organizations: Organization[],
  skills: Skill[],
  volunteerAccounts: Account[],
  modAccounts: Account[],
  defaultAccounts: Account[],
  options?: {
    activityPerOrganization?: {
      min?: number;
      max?: number;
    };
  },
) => {
  const activities: Activity[] = [];
  const activityContacts: Contact[] = [];
  const activityContactRels: ActivityContact[] = [];
  const activityLocations: Location[] = [];
  const activityLocationRels: ActivityLocation[] = [];

  organizations
    .filter((o) => o.status === OrganizationStatus.Verified)
    .forEach((organization) => {
      // activities.push({
      //   id: getNextActivityId(),
      //   isDisabled: false,
      //   status: ActivityStatus.Pending,
      //   organizationId: organization.id,
      //   name: capitalizeWords(fakerEn.lorem.words()),
      //   description: fakerEn.lorem.paragraphs(),
      //   thumbnail: null,
      //   startTime: null,
      //   endTime: null,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });

      // Object.values(ActivityStatus).forEach((status) => {
      for (
        let i = 0;
        i <
        fakerEn.number.int({
          min: options?.activityPerOrganization?.min ?? 3,
          max: options?.activityPerOrganization?.max ?? 5,
        });
        i++
      ) {
        activities.push({
          id: getNextActivityId(),
          isDisabled: fakerEn.datatype.boolean(),
          status: ActivityStatus.Pending,
          organizationId: organization.id,
          name: capitalizeWords(fakerEn.lorem.words()),
          description: fakerEn.lorem.paragraphs(),
          thumbnail: null,
          startTime: null,
          endTime: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  //});

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

  let hasApprovedShift = false;
  activities.forEach((activity) => {
    const activityLocation = generateLocation();
    activityLocations.push(activityLocation);
    activityLocationRels.push({
      activityId: activity.id,
      locationId: activityLocation.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const activitySkills: Skill[] = _.sampleSize(
      skills,
      fakerEn.number.int({ min: 1, max: skills.length }),
    );

    const numberOfShifts = fakerEn.helpers.weightedArrayElement(
      weightedNumberOfShifts,
    );
    let correctedActivityStatus: ActivityStatus | undefined = undefined;
    for (let i = 0; i < numberOfShifts; i++) {
      const shiftId = getNextShiftId();
      const shiftStatus =
        i == 0
          ? ShiftStatus.Ongoing
          : requireNonNullish(
              _.sample([ShiftStatus.Pending, ShiftStatus.Completed]),
            );
      const refTime = new Date();
      let shiftStartTime: Date;
      let shiftEndTime: Date;
      if (shiftStatus === ShiftStatus.Pending) {
        shiftStartTime = fakerEn.date.soon({ days: 15, refDate: refTime });

        let interval = dayjs(shiftStartTime)
          .add(1, 'day')
          .startOf('day')
          .diff(shiftStartTime, 'hour');
        if (interval < 1) {
          shiftStartTime = dayjs(shiftStartTime).subtract(3, 'hour').toDate();
          interval += 3;
        }

        shiftEndTime = dayjs(shiftStartTime)
          .add(interval * fakerEn.number.float({ min: 0.1, max: 1 }), 'hour')
          .toDate();
      } else if (shiftStatus === ShiftStatus.Ongoing) {
        hasApprovedShift = true;
        shiftStartTime = fakerEn.date.past({
          years: fakerEn.helpers.weightedArrayElement(weightedShiftTimeRange),
          refDate: refTime,
        });
        let interval = dayjs(shiftStartTime)
          .add(1, 'day')
          .startOf('day')
          .diff(shiftStartTime, 'hour');
        if (interval < 1) {
          shiftStartTime = dayjs(shiftStartTime).subtract(3, 'hour').toDate();
          interval += 3;
        }
        shiftEndTime = dayjs(shiftStartTime)
          .add(interval * fakerEn.number.float({ min: 0.7, max: 1 }), 'hour')
          .toDate();
      } else {
        shiftStartTime = fakerEn.date.past({ years: 1, refDate: refTime });
        let interval = dayjs(shiftStartTime)
          .add(1, 'day')
          .startOf('day')
          .diff(shiftStartTime, 'hour');
        if (interval < 1) {
          shiftStartTime = dayjs(shiftStartTime).subtract(3, 'hour').toDate();
          interval += 3;
        }
        shiftEndTime = dayjs(shiftStartTime)
          .add(interval * fakerEn.number.float({ min: 0.1, max: 1 }), 'hour')
          .toDate();
      }
      const numberOfParticipants = fakerEn.number.int({ min: 5, max: 30 });

      for (let j = 0; j < fakerEn.number.int({ min: 1, max: 3 }); j++) {
        const location = generateLocation({ region: activityLocation.region });
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
        activitySkills,
        fakerEn.number.int({ min: 1, max: activitySkills.length }),
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

      // Create approved or pending volunteers first, then use created at to determine the rest
      const accountActiveVolunteers: { [key: number]: Date } = {};
      let numberOfApprovedVolunteers = 0;
      _.sampleSize(
        [...volunteerAccounts, ...defaultAccounts],
        fakerEn.helpers.weightedArrayElement(
          Array.from({ length: numberOfParticipants + 5 }, (_, i) => ({
            value: i + 1,
            weight: 1 / (i + 1),
          })),
        ),
      ).forEach((account) => {
        const status =
          shiftStatus === ShiftStatus.Pending
            ? requireNonNullish(
                _.sample([
                  ShiftVolunteerStatus.Approved,
                  ShiftVolunteerStatus.Pending,
                ]),
              )
            : ShiftVolunteerStatus.Approved;
        if (status === ShiftVolunteerStatus.Approved) {
          numberOfApprovedVolunteers++;
        }

        const createdAt = fakerEn.date.past({
          years: 0.1,
          refDate: shiftStartTime,
        });
        const updatedAt = fakerEn.date.between({
          from: createdAt,
          to: shiftEndTime,
        });
        accountActiveVolunteers[account.id] = createdAt;
        const attendant =
          shiftStatus === ShiftStatus.Completed
            ? fakerEn.datatype.boolean()
            : false;
        const checkedIn = attendant ? fakerEn.datatype.boolean() : null;
        const checkedInAt = checkedIn
          ? fakerEn.date.between({
              from: shiftStartTime,
              to: shiftEndTime,
            })
          : null;
        const checkedOut = checkedIn ? fakerEn.datatype.boolean() : null;
        const checkOutAt =
          checkedOut && checkedInAt
            ? fakerEn.date.between({
                from: checkedInAt,
                to: shiftEndTime,
              })
            : null;
        shiftVolunteers.push({
          id: getNextShiftVolunteerId(),
          shiftId: shiftId,
          status: status,
          //attendant: attendant,
          // TODO: Temporary
          meetSkillRequirements: fakerEn.datatype.boolean(),
          checkedIn: checkedIn,
          checkInAt: checkedInAt,
          checkedOut: checkedOut,
          checkOutAt: checkOutAt,
          isCheckInVerified: attendant ? fakerEn.datatype.boolean() : null,
          isCheckOutVerified: attendant ? fakerEn.datatype.boolean() : null,
          checkInOutVerifierId: attendant
            ? fakerEn.helpers.arrayElement(modAccounts).id
            : null,
          completion: attendant
            ? fakerEn.number.float({ min: 0.5, max: 1 })
            : 0,
          reviewerId: attendant
            ? fakerEn.helpers.arrayElement(volunteerAccounts).id
            : null,
          reviewNote: fakerEn.lorem.sentence(),
          accountId: account.id,
          active: true,
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
          createdAt: createdAt,
          updatedAt: updatedAt,
        });
      });

      [
        ShiftVolunteerStatus.Cancelled,
        ShiftVolunteerStatus.Rejected,
        ShiftVolunteerStatus.Left,
        ShiftVolunteerStatus.Removed,
      ].forEach((status) => {
        const min = 3;
        let max = 0;
        if (status === ShiftVolunteerStatus.Approved) {
          max = numberOfParticipants + 20;
        } else if (status === ShiftVolunteerStatus.Pending) {
          max = numberOfParticipants + 20;
        } else if (status === ShiftVolunteerStatus.Rejected) {
          max = numberOfParticipants + 20;
        } else {
          max = 10;
        }

        _.sampleSize(
          [...volunteerAccounts, ...defaultAccounts],
          // fakerEn.helpers.weightedArrayElement(
          //   Array.from({ length: max }, (_, i) => ({
          //     value: i,
          //     weight: 1 / (i + 1),
          //   })),
          // ),
          fakerEn.number.int({ min: min, max: max }),
        ).forEach((account) => {
          if (status === ShiftVolunteerStatus.Approved) {
            numberOfApprovedVolunteers++;
          }

          // These status must be created before approved or pending volunteers
          const createdAt = fakerEn.date.past({
            years: 0.1,
            refDate: accountActiveVolunteers[account.id] ?? shiftStartTime,
          });
          const updatedAt = fakerEn.date.between({
            from: createdAt,
            to: accountActiveVolunteers[account.id] ?? shiftStartTime,
          });
          const attendant =
            shiftStatus === ShiftStatus.Completed
              ? fakerEn.datatype.boolean()
              : false;
          const checkedIn = attendant ? fakerEn.datatype.boolean() : null;
          const checkedInAt = checkedIn
            ? fakerEn.date.between({
                from: shiftStartTime,
                to: shiftEndTime,
              })
            : null;
          const checkedOut = checkedIn ? fakerEn.datatype.boolean() : null;
          const checkOutAt =
            checkedOut && checkedInAt
              ? fakerEn.date.between({
                  from: checkedInAt,
                  to: shiftEndTime,
                })
              : null;
          shiftVolunteers.push({
            id: getNextShiftVolunteerId(),
            shiftId: shiftId,
            status: status,
            // TEMPORARY
            meetSkillRequirements: fakerEn.datatype.boolean(),
            checkedIn: checkedIn,
            checkInAt: checkedInAt,
            checkedOut: checkedOut,
            checkOutAt: checkOutAt,
            isCheckInVerified: attendant ? fakerEn.datatype.boolean() : null,
            isCheckOutVerified: attendant ? fakerEn.datatype.boolean() : null,
            checkInOutVerifierId: attendant
              ? fakerEn.helpers.arrayElement(modAccounts).id
              : null,
            completion: attendant
              ? fakerEn.number.float({ min: 0.5, max: 1 })
              : 0,
            reviewerId: attendant
              ? fakerEn.helpers.arrayElement(volunteerAccounts).id
              : null,
            reviewNote: attendant ? fakerEn.lorem.sentence() : null,
            accountId: account.id,
            active: false,
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
            createdAt: createdAt,
            updatedAt: updatedAt,
          });
        });
      });

      shifts.push({
        id: shiftId,
        name: capitalizeWords(fakerEn.lorem.words()),
        description: fakerEn.lorem.paragraphs(),
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        status: shiftStatus,
        automaticStatusUpdate: true,
        numberOfParticipants: numberOfParticipants,
        availableSlots:
          numberOfParticipants == null
            ? null
            : requireNonNullish(
                _.max([0, numberOfParticipants - numberOfApprovedVolunteers]),
              ),
        joinedParticipants: numberOfApprovedVolunteers,
        checkInMinutesLimit: null,
        checkOutMinutesLimit: null,
        activityId: activity.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (correctedActivityStatus == null) {
        switch (shiftStatus) {
          case ShiftStatus.Pending:
            correctedActivityStatus = ActivityStatus.Pending;
            break;
          case ShiftStatus.Completed:
            correctedActivityStatus = ActivityStatus.Completed;
            break;
          case ShiftStatus.Ongoing:
            correctedActivityStatus = ActivityStatus.Ongoing;
            break;
        }
      } else {
        if (correctedActivityStatus === ActivityStatus.Pending) {
          if (shiftStatus !== ShiftStatus.Pending) {
            correctedActivityStatus = ActivityStatus.Ongoing;
          }
        }
        if (correctedActivityStatus === ActivityStatus.Completed) {
          if (shiftStatus !== ShiftStatus.Completed) {
            correctedActivityStatus = ActivityStatus.Ongoing;
          }
        }
      }
      activity.startTime =
        activity.startTime == null
          ? shiftStartTime
          : _.min([activity.startTime, shiftStartTime]) ?? null;
      activity.endTime =
        activity.endTime == null
          ? shiftEndTime
          : _.max([activity.endTime, shiftEndTime]) ?? null;
      activity.status = correctedActivityStatus;
    }
  });

  await prisma.activity.createMany({
    data: activities,
  });

  await prisma.contact.createMany({
    data: activityContacts,
  });

  await prisma.location.createMany({
    data: activityLocations,
  });

  await prisma.activityContact.createMany({
    data: activityContactRels,
  });

  await prisma.activityLocation.createMany({
    data: activityLocationRels,
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
    shiftSkills,
  };
};

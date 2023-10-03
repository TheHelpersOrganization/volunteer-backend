import { ActivityStatus } from '@app/activity/constants';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { ShiftStatus } from '@app/shift/constants';
import { faker as fakerEn } from '@faker-js/faker/locale/en';
import {
  Account,
  Activity,
  ActivityContact,
  ActivityLocation,
  Contact,
  Location,
  Member,
  Organization,
  PrismaClient,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftManager,
  ShiftSkill,
  Skill,
  VolunteerShift,
} from '@prisma/client';
import dayjs from 'dayjs';
import _ from 'lodash';
import {
  OrganizationMemberStatus,
  OrganizationStatus,
} from '../../src/organization/constants';
import { seedFiles } from './seed-file';
import { skillTypeFromSkillId } from './seed-skill';
import {
  SkillType,
  generateLocation,
  getActivityTemplateAt,
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
  members: Member[],
  skills: Skill[],
  volunteerAccounts: Account[],
  modAccounts: Account[],
  adminAccounts: Account[],
  defaultAccounts: Account[],
  contacts: Contact[],
  options?: {
    runWithoutDb?: boolean;
    activityPerOrganization?: {
      min?: number;
      max?: number;
    };
    accountPreferences?: {
      [id: number]: {
        locations?: string[];
        skills?: SkillType[];
        startHour?: number[];
        duration?: number[];
      };
    };
    joinIfMatchAccountPreferences?: boolean;
  },
) => {
  const activities: Activity[] = [];
  const activityContactRels: ActivityContact[] = [];
  const activityLocations: Location[] = [];
  const activityLocationRels: ActivityLocation[] = [];
  const activityManagers: number[] = [];

  const shifts: Shift[] = [];
  const shiftLocations: Location[] = [];
  const shiftLocationsRel: ShiftLocation[] = [];
  const shiftContacts: Contact[] = [];
  const shiftContactsRel: ShiftContact[] = [];
  const shiftSkills: ShiftSkill[] = [];
  const shiftVolunteers: VolunteerShift[] = [];
  const shiftManagers: ShiftManager[] = [];

  organizations
    .filter((o) => o.status === OrganizationStatus.Verified)
    .forEach((organization) => {
      const organizationRatingBias = fakerEn.number.int({ min: 1, max: 5 });
      const organizationMembers = members.filter(
        (m) =>
          m.organizationId === organization.id &&
          m.status === OrganizationMemberStatus.Approved,
      );

      for (
        let activityIndex = 0;
        activityIndex <
        fakerEn.number.int({
          min: options?.activityPerOrganization?.min ?? 5,
          max: options?.activityPerOrganization?.max ?? 50,
        });
        activityIndex++
      ) {
        const activityId = getNextActivityId();
        const activityRatingBias = generateRating(organizationRatingBias);
        // Id start from 1
        const template = getActivityTemplateAt(activityId - 1);
        const activity: Activity = {
          id: activityId,
          isDisabled: fakerEn.datatype.boolean(),
          disabledBy: _.sample(adminAccounts)?.id ?? null,
          status: ActivityStatus.Pending,
          organizationId: organization.id,
          name: template.name,
          description: template.description,
          thumbnail: null,
          startTime: null,
          endTime: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          rating: null,
          ratingCount: 0,
        };
        activities.push(activity);

        const activityManagerIds = _.sampleSize(
          organizationMembers.map((m) => m.accountId),
          fakerEn.number.int({ min: 1, max: 3 }),
        );

        activityManagers.push(...activityManagerIds);

        activityManagerIds.forEach((activityManagerId) => {
          const contact = _.sample(
            contacts.filter((c) => c.accountId === activityManagerId),
          );
          if (!contact) {
            return;
          }
          activityContactRels.push({
            activityId: activity.id,
            contactId: contact.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });

        const activityLocation = generateLocation();
        activityLocations.push(activityLocation);
        activityLocationRels.push({
          activityId: activity.id,
          locationId: activityLocation.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const activitySkills: Skill[] = template.skillTypes.flatMap(
          (skillType) =>
            requireNonNullish(skills.find((s) => s.name === skillType)),
        );
        if (activitySkills.length === 0) {
          activitySkills.push(
            ..._.sampleSize(
              skills,
              fakerEn.helpers.weightedArrayElement([
                { weight: 10, value: 1 },
                { weight: 3, value: 2 },
                { weight: 1, value: 3 },
              ]),
            ),
          );
        }

        const activityStatus: ActivityStatus =
          activityIndex == 0
            ? ActivityStatus.Ongoing
            : requireNonNullish(_.sample(Object.values(ActivityStatus)));
        activity.status = activityStatus;

        const numberOfShifts = fakerEn.helpers.weightedArrayElement(
          weightedNumberOfShifts,
        );

        for (let shiftIndex = 0; shiftIndex < numberOfShifts; shiftIndex++) {
          const shiftId = getNextShiftId();
          const shiftName = generateShiftName(activity.name, shiftIndex + 1);
          const shiftRatingBias = generateRating(activityRatingBias);
          let shiftStatus: ShiftStatus;
          switch (activityStatus) {
            case ActivityStatus.Pending:
              shiftStatus = ShiftStatus.Pending;
              break;
            case ActivityStatus.Completed:
              shiftStatus = ShiftStatus.Completed;
              break;
            default:
              shiftStatus =
                shiftIndex == 0
                  ? ShiftStatus.Ongoing
                  : requireNonNullish(
                      _.sample([ShiftStatus.Pending, ShiftStatus.Completed]),
                    );
          }
          const refTime = new Date();
          let shiftStartTime: Date;
          let shiftEndTime: Date;
          if (shiftStatus === ShiftStatus.Pending) {
            shiftStartTime = fakerEn.date.soon({ days: 30, refDate: refTime });

            let interval = dayjs(shiftStartTime)
              .add(1, 'day')
              .startOf('day')
              .diff(shiftStartTime, 'hour');
            interval = Math.max(interval, 12);
            if (interval < 1) {
              shiftStartTime = dayjs(shiftStartTime)
                .subtract(3, 'hour')
                .toDate();
              interval += 3;
            }

            shiftEndTime = dayjs(shiftStartTime)
              .add(
                interval * fakerEn.number.float({ min: 0.1, max: 0.3 }),
                'hour',
              )
              .toDate();
          } else if (shiftStatus === ShiftStatus.Ongoing) {
            shiftStartTime = fakerEn.date.past({
              years: fakerEn.helpers.weightedArrayElement(
                weightedShiftTimeRange,
              ),
              refDate: refTime,
            });
            let interval = dayjs(shiftStartTime)
              .add(1, 'day')
              .startOf('day')
              .diff(shiftStartTime, 'hour');
            interval = Math.max(interval, 12);
            if (interval < 1) {
              shiftStartTime = dayjs(shiftStartTime)
                .subtract(3, 'hour')
                .toDate();
              interval += 3;
            }
            shiftEndTime = dayjs(shiftStartTime)
              .add(
                interval * fakerEn.number.float({ min: 0.1, max: 0.3 }),
                'hour',
              )
              .toDate();
          } else {
            shiftStartTime = fakerEn.date.past({ years: 1, refDate: refTime });
            let interval = dayjs(shiftStartTime)
              .add(1, 'day')
              .startOf('day')
              .diff(shiftStartTime, 'hour');
            if (interval < 1) {
              shiftStartTime = dayjs(shiftStartTime)
                .subtract(3, 'hour')
                .toDate();
              interval += 3;
            }
            shiftEndTime = dayjs(shiftStartTime)
              .add(
                interval * fakerEn.number.float({ min: 0.1, max: 1 }),
                'hour',
              )
              .toDate();
          }
          const numberOfParticipants = fakerEn.number.int({ min: 5, max: 30 });

          const locations: Location[] = [];
          for (let j = 0; j < fakerEn.number.int({ min: 1, max: 3 }); j++) {
            const location = generateLocation({
              region: activityLocation.region,
            });
            locations.push(location);
            shiftLocationsRel.push({
              shiftId: shiftId,
              locationId: location.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          shiftLocations.push(...locations);

          const sm = _.sampleSize(
            organizationMembers,
            fakerEn.number.int({ min: 1, max: 3 }),
          ).map((m) => ({
            shiftId: shiftId,
            accountId: m.accountId,
            name: null,
            description: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          shiftManagers.push(...sm);

          sm.forEach((m) => {
            const contact = _.sample(
              contacts.filter((c) => c.accountId === m.accountId),
            );
            if (!contact) {
              return;
            }
            shiftContactsRel.push({
              shiftId: shiftId,
              contactId: contact.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          });

          const shiftSkill = {
            shiftId: shiftId,
            skillId: requireNonNullish(_.sample(activitySkills)).id,
            hours: fakerEn.number.float({
              min: 0.5,
              max: 12,
              precision: 0.5,
            }),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          shiftSkills.push(shiftSkill);

          // Create approved or pending volunteers first, then use created at to determine the rest
          const accountActiveVolunteers: { [key: number]: Date } = {};
          const filteredDefaultAccount: Account[] = defaultAccounts.filter(
            (account) => {
              if (options?.accountPreferences?.[account.id]?.locations) {
                const preferredLocations =
                  options.accountPreferences[account.id].locations!;
                const ok = locations.some((location) => {
                  if (
                    location.country &&
                    preferredLocations.some((l) =>
                      l.includes(location.country!),
                    )
                  ) {
                    return true;
                  }
                  if (
                    location.region &&
                    preferredLocations.some((l) => l.includes(location.region!))
                  ) {
                    return true;
                  }
                  if (
                    location.locality &&
                    preferredLocations.some((l) =>
                      l.includes(location.locality!),
                    )
                  ) {
                    return true;
                  }
                  return false;
                });
                if (!ok) {
                  return false;
                }
              }
              if (options?.accountPreferences?.[account.id]?.skills) {
                const skills = options.accountPreferences[account.id].skills!;
                const ok = skills.includes(
                  skillTypeFromSkillId(shiftSkill.skillId),
                );
                if (!ok) {
                  return false;
                }
              }
              if (options?.accountPreferences?.[account.id]?.startHour) {
                const startHour =
                  options.accountPreferences[account.id].startHour!;
                const ok = startHour.some(
                  (h) =>
                    dayjs(shiftStartTime).hour() >= h &&
                    dayjs(shiftStartTime).hour() < h + 1,
                );
                if (!ok) {
                  return false;
                }
              }
              if (options?.accountPreferences?.[account.id]?.duration) {
                const duration =
                  options.accountPreferences[account.id].duration!;
                const ok = duration.some(
                  (d) =>
                    dayjs(shiftEndTime).diff(shiftStartTime, 'hour') >= d &&
                    dayjs(shiftEndTime).diff(shiftStartTime, 'hour') < d + 1,
                );
                if (!ok) {
                  return false;
                }
              }
              return true;
            },
          );
          let numberOfApprovedVolunteers = 0;
          const joinedAccounts = _.sampleSize(
            [...volunteerAccounts, ...filteredDefaultAccount],
            fakerEn.helpers.weightedArrayElement(
              Array.from({ length: numberOfParticipants + 5 }, (_, i) => ({
                value: i + 1,
                weight: 1 / (i + 1),
              })),
            ),
          );
          if (
            options?.joinIfMatchAccountPreferences &&
            options?.accountPreferences
          ) {
            for (const key in options.accountPreferences) {
              if (
                !joinedAccounts.some((v) => v.id === Number(key)) &&
                filteredDefaultAccount.some((v) => v.id === Number(key))
              ) {
                //console.log('Joining account', key);
                joinedAccounts.push(
                  filteredDefaultAccount.find((v) => v.id === Number(key))!,
                );
              }
            }
          }
          joinedAccounts.forEach((account) => {
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
            const shiftRating =
              shiftStatus === ShiftStatus.Completed
                ? generateRating(shiftRatingBias)
                : null;
            const shiftRatingComment =
              shiftStatus === ShiftStatus.Completed
                ? fakerEn.lorem.sentence()
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
              shiftRating: shiftRating,
              shiftRatingComment: shiftRatingComment,
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

            const joinedAccounts = _.sampleSize(
              [...volunteerAccounts, ...filteredDefaultAccount],
              fakerEn.number.int({ min: min, max: max }),
            );

            joinedAccounts.forEach((account) => {
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
              const shiftRating =
                shiftStatus === ShiftStatus.Completed
                  ? generateRating(shiftRatingBias)
                  : null;
              const shiftRatingComment =
                shiftStatus === ShiftStatus.Completed
                  ? fakerEn.lorem.sentence()
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
                isCheckInVerified: attendant
                  ? fakerEn.datatype.boolean()
                  : null,
                isCheckOutVerified: attendant
                  ? fakerEn.datatype.boolean()
                  : null,
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
                shiftRating: shiftRating,
                shiftRatingComment: shiftRatingComment,
                createdAt: createdAt,
                updatedAt: updatedAt,
              });
            });
          });

          const ratedShiftVolunteers = shiftVolunteers.filter(
            (v) =>
              v.shiftId === shiftId &&
              v.status === ShiftVolunteerStatus.Approved &&
              v.shiftRating != null,
          );
          const averageRating =
            ratedShiftVolunteers.length === 0
              ? null
              : _.meanBy(ratedShiftVolunteers, (v) => v.shiftRating);
          shifts.push({
            id: shiftId,
            name: shiftName,
            description: activity.description,
            startTime: shiftStartTime,
            endTime: shiftEndTime,
            status: shiftStatus,
            automaticStatusUpdate: true,
            numberOfParticipants: numberOfParticipants,
            availableSlots:
              numberOfParticipants == null
                ? null
                : requireNonNullish(
                    _.max([
                      0,
                      numberOfParticipants - numberOfApprovedVolunteers,
                    ]),
                  ),
            joinedParticipants: numberOfApprovedVolunteers,
            checkInMinutesLimit: null,
            checkOutMinutesLimit: null,
            rating: averageRating,
            ratingCount: ratedShiftVolunteers.length,
            activityId: activity.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          const ratedShifts = shifts.filter(
            (s) => s.activityId === activity.id && s.rating != null,
          );
          activity.rating =
            ratedShifts.length === 0
              ? null
              : _.meanBy(ratedShifts, (s) => s.rating);
          activity.ratingCount = ratedShifts.reduce(
            (sum, s) => sum + (s.ratingCount ?? 0),
            0,
          );
          activity.startTime =
            activity.startTime == null
              ? shiftStartTime
              : _.min([activity.startTime, shiftStartTime]) ?? null;
          activity.endTime =
            activity.endTime == null
              ? shiftEndTime
              : _.max([activity.endTime, shiftEndTime]) ?? null;
        }
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
    {
      skipInsertIntoDatabase: options?.runWithoutDb,
    },
  );
  activities.forEach((activity, index) => {
    activity.thumbnail = thumbnails[index]?.id ?? null;
  });

  if (options?.runWithoutDb) {
    return {
      activities: activities,
      shifts,
      shiftVolunteers,
      shiftSkills,
    };
  }

  await prisma.activity.createMany({
    data: activities,
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

const weightedRatings = Array.from({ length: 5 }).map((_, i) => {
  const bias = i + 1;
  return Array.from({ length: 5 }).map((_, j) => {
    const rating = j + 1;
    return {
      weight: rating === bias ? 10 : Math.abs(rating - bias) === 1 ? 5 : 1,
      value: rating,
    };
  });
});

const generateRating = (bias: number) => {
  const weighted = weightedRatings[bias - 1];
  const rating = fakerEn.helpers.weightedArrayElement(weighted);
  return rating;
};

const generateShiftName = (activityName: string, shiftIndex: number) => {
  // If activity name is short, use activity name plus shift index
  if (activityName.length <= 15) {
    return generateShiftNameFromActivityName(activityName, shiftIndex);
  }
  return generateShiftNameFromIndex(shiftIndex);
};

const generateShiftNameFromIndex = (shiftIndex: number) => {
  const shiftName = `Shift ${shiftIndex + 1}`;
  return shiftName;
};

const generateShiftNameFromActivityName = (
  activityName: string,
  shiftIndex: number,
) => {
  const shiftName = `${activityName} - Shift ${shiftIndex + 1}`;
  return shiftName;
};

import { Prisma } from '@prisma/client';
import { unionLocationsTransform } from 'src/common/transformers';
import { ShiftVolunteerStatus } from 'src/shift-volunteer/constants';
import {
  BaseGetActivityQueryDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  ModGetActivitiesQueryDto,
} from '../dtos';
import { ExtendedActivity, ExtendedActivityInput } from '../types';

export const getShiftFilter = (
  query: BaseGetActivityQueryDto,
  extra?: { joiner?: number },
) => {
  let shiftQuery: Prisma.ShiftListRelationFilter | undefined = undefined;

  let shiftSomeAndQuery: Prisma.Enumerable<Prisma.ShiftWhereInput> | undefined =
    undefined;
  if (query.startDate) {
    shiftSomeAndQuery = [
      {
        startTime: {
          gte: query.startDate[0],
          lte: query.startDate[1],
        },
      },
    ];
    shiftQuery = {
      some: {
        AND: shiftSomeAndQuery,
      },
    };
  }
  if (query.endDate) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        endTime: {
          gte: query.endDate[0],
          lte: query.endDate[1],
        },
      },
    };
  }
  if (query.skill) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        shiftSkills: {
          some: {
            skillId: {
              in: query.skill,
            },
          },
        },
      },
    };
  }
  if (query.locality || query.region || query.country) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        shiftLocations: {
          some: {
            location: {
              locality: {
                contains: query.locality?.trim(),
                mode: 'insensitive',
              },
              region: {
                contains: query.region?.trim(),
                mode: 'insensitive',
              },
              country: query.country,
            },
          },
        },
      },
    };
  }
  if (query instanceof GetActivityByIdQueryDto) {
    if (query.joinStatus && extra && extra.joiner) {
      shiftQuery = {
        ...shiftQuery,
        some: {
          shiftVolunteers: {
            some: {
              status: {
                in: query.joinStatus,
              },
              accountId: extra.joiner,
            },
          },
        },
      };
    }
  }

  return shiftQuery;
};

export const getActivityFilter = (
  query: BaseGetActivityQueryDto,
  extra?: { joiner?: number; organizationOwner?: number },
) => {
  let activityQuery: Prisma.ActivityWhereInput | undefined = undefined;

  if (query instanceof GetActivitiesQueryDto && query.ids) {
    activityQuery = {
      id: {
        in: query.ids,
      },
    };
  }
  if (query.name) {
    activityQuery = {
      ...activityQuery,
      name: {
        contains: query.name.trim(),
        mode: 'insensitive',
      },
    };
  }
  if (
    query instanceof GetActivityByIdQueryDto ||
    query instanceof ModGetActivitiesQueryDto
  ) {
    if (query.status) {
      activityQuery = {
        ...activityQuery,
        status: {
          in: query.status,
        },
      };
    }
  }

  if (query instanceof GetActivityByIdQueryDto) {
    if (query.org) {
      activityQuery = {
        ...activityQuery,
        organizationId: {
          in: query.org,
        },
      };
    }
  }

  const shiftQuery = getShiftFilter(query, extra);
  if (shiftQuery) {
    activityQuery = {
      ...activityQuery,
      shifts: shiftQuery,
    };
  }
  return activityQuery;
};

export const extendActivity = (
  activity: ExtendedActivityInput,
): ExtendedActivity => {
  let maxParticipants: number | null = 0;
  let joinedParticipants = 0;
  let startTime: Date | undefined = undefined;
  let endTime: Date | undefined = undefined;

  for (const shift of activity.shifts) {
    if (maxParticipants != null) {
      if (shift.numberOfParticipants == null) {
        maxParticipants = null;
      } else {
        maxParticipants += shift.numberOfParticipants;
      }
    }
    for (const shiftVolunteer of shift.shiftVolunteers) {
      if (
        shiftVolunteer.status == ShiftVolunteerStatus.Approved ||
        shiftVolunteer.status == ShiftVolunteerStatus.Pending
      ) {
        joinedParticipants++;
      }
    }
    if (startTime == null) {
      startTime = shift.startTime;
    } else if (shift.startTime.getTime() < startTime.getTime()) {
      startTime = shift.startTime;
    }
    if (endTime == null) {
      endTime = shift.endTime;
    } else if (shift.endTime.getTime() > endTime.getTime()) {
      endTime = shift.endTime;
    }
  }

  const locations = activity.shifts?.flatMap((s) =>
    s.shiftLocations.map((sl) => sl.location),
  );
  const unionLocation = locations
    ? unionLocationsTransform(locations)
    : undefined;

  const skillIds = activity.shifts?.flatMap((shift) =>
    shift.shiftSkills?.map((sk) => sk.skillId),
  );
  const filteredSkillIds: number[] = [];
  skillIds?.forEach((skillId) => {
    if (skillId == null) {
      return;
    }
    if (filteredSkillIds.includes(skillId)) {
      return;
    }
    filteredSkillIds.push(skillId);
  });
  const contacts = activity.activityContacts?.map((ac) => ac.contact);
  const activityManagerIds = activity.activityManagers?.map(
    (am) => am.accountId,
  );
  return {
    ...activity,
    maxParticipants,
    joinedParticipants,
    startTime,
    endTime,
    skillIds: filteredSkillIds,
    location: unionLocation,
    contacts,
    activityManagerIds,
  };
};

export const filterExtendedActivity = (
  activity: ExtendedActivity,
  query: GetActivitiesQueryDto,
) => {
  if (query.availableSlots != null) {
    const availableSlots =
      activity.maxParticipants == null || activity.maxParticipants == 0
        ? null
        : activity.maxParticipants - activity.joinedParticipants;
    if (availableSlots != null && availableSlots < query.availableSlots) {
      return false;
    }
  }
  if (query.startDate != null) {
    if (activity.startTime == null) {
      return false;
    }
    if (
      activity.startTime.getTime() < query.startDate[0].getTime() ||
      activity.startTime.getTime() > query.startDate[1].getTime()
    ) {
      return false;
    }
  }
  if (query.endDate != null) {
    if (activity.endTime == null) {
      return false;
    }
    if (
      activity.endTime.getTime() < query.endDate[0].getTime() ||
      activity.endTime.getTime() > query.endDate[1].getTime()
    ) {
      return false;
    }
  }
  return true;
};

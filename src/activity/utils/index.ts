import { Prisma } from '@prisma/client';
import { ShiftVolunteerStatus } from 'src/shift/constants';
import { GetActivitiesQueryDto, GetActivityByIdQueryDto } from '../dtos';
import { ExtendedActivity, ExtendedActivityInput } from '../types';

export const getShiftFilter = (query: GetActivitiesQueryDto) => {
  let shiftQuery: Prisma.ShiftListRelationFilter | undefined = undefined;
  shiftQuery = {
    some: {},
  };
  let shiftSomeAndQuery: Prisma.Enumerable<Prisma.ShiftWhereInput> | undefined =
    undefined;
  if (query.st) {
    shiftSomeAndQuery = [
      {
        startTime: {
          gte: query.st[0],
          lte: query.st[1],
        },
      },
    ];
    shiftQuery = {
      some: {
        AND: shiftSomeAndQuery,
      },
    };
  }
  if (query.et) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        endTime: {
          gte: query.et[0],
          lte: query.et[1],
        },
      },
    };
  }
  if (query.sk) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        shiftSkills: {
          some: {
            skillId: {
              in: query.sk,
            },
          },
        },
      },
    };
  }
  if (query.lc || query.rg || query.ct) {
    shiftQuery = {
      ...shiftQuery,
      some: {
        shiftLocations: {
          some: {
            location: {
              locality: {
                contains: query.lc?.trim(),
                mode: 'insensitive',
              },
              region: {
                contains: query.rg?.trim(),
                mode: 'insensitive',
              },
              country: query.ct,
            },
          },
        },
      },
    };
  }
  return shiftQuery;
};

export const getActivityFilter = (
  query: GetActivityByIdQueryDto | GetActivitiesQueryDto,
) => {
  let activityQuery: Prisma.ActivityWhereInput | undefined = undefined;

  if (query instanceof GetActivitiesQueryDto && query.ids) {
    activityQuery = {
      id: {
        in: query.ids,
      },
    };
  }
  if (query.n) {
    activityQuery = {
      ...activityQuery,
      name: {
        contains: query.n.trim(),
        mode: 'insensitive',
      },
    };
  }
  if (query.org) {
    activityQuery = {
      ...activityQuery,
      organizationId: {
        in: query.org,
      },
    };
  }
  if (query.as) {
    activityQuery = {
      ...activityQuery,
      activitySkills: {
        some: {
          skillId: {
            in: query.as,
          },
        },
      },
    };
  }
  const shiftQuery = getShiftFilter(query);
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

  return {
    ...activity,
    maxParticipants,
    joinedParticipants,
    startTime,
    endTime,
  };
};

export const filterExtendedActivity = (
  activity: ExtendedActivity,
  query: GetActivitiesQueryDto,
) => {
  if (query.av != null) {
    const availableSlots =
      activity.maxParticipants == null || activity.maxParticipants == 0
        ? null
        : activity.maxParticipants - activity.joinedParticipants;
    if (availableSlots != null && availableSlots < query.av) {
      return false;
    }
  }
  if (query.st != null) {
    if (activity.startTime == null) {
      return false;
    }
    if (
      activity.startTime.getTime() < query.st[0].getTime() ||
      activity.startTime.getTime() > query.st[1].getTime()
    ) {
      return false;
    }
  }
  if (query.et != null) {
    if (activity.endTime == null) {
      return false;
    }
    if (
      activity.endTime.getTime() < query.et[0].getTime() ||
      activity.endTime.getTime() > query.et[1].getTime()
    ) {
      return false;
    }
  }
  return true;
};

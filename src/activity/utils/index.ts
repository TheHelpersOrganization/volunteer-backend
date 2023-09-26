import { RequestContext } from '@app/common/request-context';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { Prisma } from '@prisma/client';
import { isPointWithinRadius } from 'geolib';
import {
  BaseGetActivityQueryDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  GetActivitySort,
  ModGetActivitiesQueryDto,
} from '../dtos';
import { ExtendedActivity, ExtendedActivityInput } from '../types';

export const getShiftFilter = (
  context: RequestContext,
  query: BaseGetActivityQueryDto,
  extra?: { joiner?: number },
) => {
  let shiftQuery: Prisma.ShiftListRelationFilter | undefined = undefined;

  if (query.isShiftManager) {
    shiftQuery = {
      some: {
        shiftManagers: {
          some: {
            accountId: context.account.id,
          },
        },
      },
    };
  }
  if (query.skill) {
    shiftQuery = {
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
  if (query.joinedAccount) {
    if (shiftQuery == null) {
      shiftQuery = {};
    }
    if (shiftQuery.some == null) {
      shiftQuery.some = {};
    }
    if (shiftQuery.some.shiftVolunteers == null) {
      shiftQuery.some.shiftVolunteers = {};
    }
    if (shiftQuery.some.shiftVolunteers.some == null) {
      shiftQuery.some.shiftVolunteers.some = {};
    }
    shiftQuery.some.shiftVolunteers.some = {
      accountId: {
        in: query.joinedAccount,
      },
      status: {
        in: [ShiftVolunteerStatus.Approved],
      },
    };
  }
  if (query instanceof GetActivityByIdQueryDto) {
    if (query.joinStatus && extra && extra.joiner) {
      if (shiftQuery == null) {
        shiftQuery = {};
      }
      if (shiftQuery.some == null) {
        shiftQuery.some = {};
      }
      if (shiftQuery.some.shiftVolunteers == null) {
        shiftQuery.some.shiftVolunteers = {};
      }
      if (shiftQuery.some.shiftVolunteers.some == null) {
        shiftQuery.some.shiftVolunteers.some = {};
      }
      shiftQuery.some.shiftVolunteers.some = {
        status: {
          in: query.joinStatus,
        },
        accountId: extra.joiner,
      };
    }
  }

  return shiftQuery;
};

export const getActivityFilter = (
  context: RequestContext,
  query: BaseGetActivityQueryDto,
  extra?: { joiner?: number; organizationOwner?: number },
) => {
  let activityQuery: Prisma.ActivityWhereInput = {};

  if (query['ids']) {
    activityQuery = {
      id: {
        in: query['ids'],
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
  if (query.isDisabled != null) {
    activityQuery = {
      ...activityQuery,
      isDisabled: query.isDisabled,
    };
  }
  if (query.startTime) {
    activityQuery = {
      ...activityQuery,
      startTime: {
        gte: query.startTime[0],
        lte: query.startTime[1],
      },
    };
  }
  if (query.isManager) {
    activityQuery = {
      ...activityQuery,
      activityManagers: {
        some: {
          accountId: context.account.id,
        },
      },
    };
  }

  if (query.endTime) {
    activityQuery = {
      ...activityQuery,
      endTime: {
        gte: query.endTime[0],
        lte: query.endTime[1],
      },
    };
  }
  if (query.locality || query.region || query.country) {
    activityQuery.ActivityLocation = {
      some: {
        Location: {
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

  const shiftQuery = getShiftFilter(context, query, extra);
  if (shiftQuery) {
    activityQuery = {
      ...activityQuery,
      shifts: shiftQuery,
    };
  }
  return activityQuery;
};

export const getActivitySort = (query: BaseGetActivityQueryDto) => {
  const sort: Prisma.ActivityOrderByWithAggregationInput = {};
  if (query.sort?.includes(GetActivitySort.NameAsc)) {
    sort.name = 'asc';
  } else if (query.sort?.includes(GetActivitySort.NameDesc)) {
    sort.name = 'desc';
  }
  if (query.sort?.includes(GetActivitySort.StartTimeAsc)) {
    sort.startTime = 'asc';
  } else if (query.sort?.includes(GetActivitySort.StartTimeAsc)) {
    sort.startTime = 'desc';
  }
  if (query.sort?.includes(GetActivitySort.EndTimeAsc)) {
    sort.endTime = 'asc';
  } else if (query.sort?.includes(GetActivitySort.EndTimeDesc)) {
    sort.endTime = 'desc';
  }
  return sort;
};

export const extendActivity = (
  activity: ExtendedActivityInput,
  extra: {
    contextAccountId: number;
  },
): ExtendedActivity => {
  let maxParticipants: number | null = 0;
  let joinedParticipants = 0;

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
  }

  const skillIds = activity.shifts?.flatMap(
    (shift) => shift.shiftSkills?.map((sk) => sk.skillId),
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
  const isManager = activityManagerIds?.includes(extra.contextAccountId);
  let isShiftManager = false;
  let shiftManagerCount = 0;
  activity.shifts?.forEach((shift) => {
    const shiftManagerIds = shift.shiftManagers?.find(
      (sm) => sm.accountId === extra.contextAccountId,
    );
    const res = shiftManagerIds != null;
    if (res) {
      shiftManagerCount++;
      isShiftManager = true;
    }
    return res;
  });
  return {
    ...activity,
    maxParticipants,
    joinedParticipants,
    skillIds: filteredSkillIds,
    location: activity.ActivityLocation?.[0]?.Location,
    contacts,
    activityManagerIds,
    isManager,
    isShiftManager,
    shiftManagerCount,
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
  if (
    query.radius != null &&
    query.lat != null &&
    query.lng != null &&
    activity.location != null &&
    activity.location.latitude != null &&
    activity.location.longitude != null
  ) {
    const isWithinRadius = isPointWithinRadius(
      {
        latitude: activity.location.latitude,
        longitude: activity.location.longitude,
      },
      {
        latitude: query.lat,
        longitude: query.lng,
      },
      // km to m
      query.radius * 1000,
    );
    if (!isWithinRadius) {
      return false;
    }
  }
  return true;
};

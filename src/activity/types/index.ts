import {
  Activity,
  ActivityManager,
  ActivitySkill,
  Contact,
  Location,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftSkill,
  VolunteerShift,
} from '@prisma/client';

export type ExtendedActivityInput = Activity & {
  activitySkills?: ActivitySkill[];
  activityManagers?: ActivityManager[];
  shifts: (Shift & {
    shiftLocations: (ShiftLocation & {
      location: Location;
    })[];
    shiftSkills: ShiftSkill[];
    shiftContacts: (ShiftContact & { contact: Contact })[];
    shiftVolunteers: VolunteerShift[];
  })[];
};

export type ExtendedActivity = ExtendedActivityInput & {
  maxParticipants?: number | null;
  joinedParticipants: number;
  startTime?: Date;
  endTime?: Date;
};

export type RawActivity = Activity & {
  activitySkills?: ActivitySkill[];
  activityManagers?: ActivityManager[];
  shifts?: (Shift & {
    shiftLocations: (ShiftLocation & {
      location: Location;
    })[];
    shiftSkills: ShiftSkill[];
    shiftContacts: (ShiftContact & { contact: Contact })[];
  })[];
  maxParticipants?: number | null;
  joinedParticipants?: number;
  startTime?: Date;
  endTime?: Date;
};

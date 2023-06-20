import {
  Activity,
  ActivityContact,
  ActivityManager,
  ActivitySkill,
  Contact,
  Location,
  Shift,
  ShiftContact,
  ShiftLocation,
  ShiftManager,
  ShiftSkill,
  VolunteerShift,
} from '@prisma/client';
import { ShortLocationOutputDto } from 'src/location/dtos';

export type ExtendedActivityInput = Activity & {
  activitySkills?: ActivitySkill[];
  activityManagers?: ActivityManager[];
  activityContacts?: (ActivityContact & { contact: Contact })[];
  shifts: (Shift & {
    shiftLocations: (ShiftLocation & {
      location: Location;
    })[];
    shiftSkills: ShiftSkill[];
    shiftContacts: (ShiftContact & { contact: Contact })[];
    shiftVolunteers: VolunteerShift[];
    shiftManagers: ShiftManager[];
  })[];
};

export type ExtendedActivity = ExtendedActivityInput & {
  maxParticipants?: number | null;
  joinedParticipants: number;
  skillIds?: number[];
  location?: ShortLocationOutputDto;
  contacts?: Contact[];
  activityManagerIds?: number[];
  isManager?: boolean;
  isShiftManager?: boolean;
  shiftManagerCount?: number;
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
  startTime?: Date | null;
  endTime?: Date | null;
  skillIds?: number[];
  location?: ShortLocationOutputDto;
  contacts?: Contact[];
  isManager?: boolean;
  isShiftManager?: boolean;
  shiftManagerCount?: number;
};

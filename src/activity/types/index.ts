import { LocationOutputDto, ShortLocationOutputDto } from '@app/location/dtos';
import {
  Activity,
  ActivityContact,
  ActivityLocation,
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

export type ExtendedActivityInput = Activity & {
  activitySkills?: ActivitySkill[];
  activityManagers?: ActivityManager[];
  activityContacts?: (ActivityContact & { contact: Contact })[];
  ActivityLocation?: (ActivityLocation & { Location: Location })[];
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
  location?: LocationOutputDto;
  contacts?: Contact[];
  activityManagerIds?: number[];
  isManager?: boolean;
  isShiftManager?: boolean;
  shiftManagerCount?: number;
};

export type RawActivity = Activity & {
  activitySkills?: ActivitySkill[];
  activityManagers?: ActivityManager[];
  activityContacts?: (ActivityContact & { contact: Contact })[];
  ActivityLocation?: (ActivityLocation & { Location: Location })[];
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

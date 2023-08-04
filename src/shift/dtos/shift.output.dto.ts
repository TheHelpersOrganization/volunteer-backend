import { ContactOutputDto } from '@app/contact/dtos';
import { LocationOutputDto } from '@app/location/dtos';
import { Expose, Type } from 'class-transformer';
import { ShiftManagerOutputDto } from './shift-manager.output.dto';

import { ActivityOutputDto } from '@app/activity/dtos';
import { ShiftSkillOutputDto } from '@app/shift-skill/dtos';
import { ShiftVolunteerOutputDto } from '@app/shift-volunteer/dtos';
import { ShiftStatus } from '../constants';

export class ShiftMeOutputDto {
  @Expose()
  isShiftManager?: boolean;

  @Expose()
  canCheckIn?: boolean;

  @Expose()
  canCheckOut?: boolean;
}

export class ShiftOutputDto {
  @Expose()
  id: number;

  @Expose()
  activityId: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  status: ShiftStatus;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  numberOfParticipants: number;

  @Expose()
  joinedParticipants: number;

  @Expose()
  availableSlots: number;

  @Expose()
  @Type(() => LocationOutputDto)
  locations: LocationOutputDto[];

  @Expose()
  @Type(() => ContactOutputDto)
  contacts: ContactOutputDto[];

  @Expose()
  @Type(() => ShiftSkillOutputDto)
  shiftSkills: ShiftSkillOutputDto[];

  @Expose()
  @Type(() => ShiftVolunteerOutputDto)
  shiftVolunteers: ShiftVolunteerOutputDto[];

  @Expose()
  @Type(() => ShiftManagerOutputDto)
  shiftManagers: ShiftManagerOutputDto;

  // ----- Extra fields -----

  @Expose()
  @Type(() => ShiftVolunteerOutputDto)
  myShiftVolunteer: ShiftVolunteerOutputDto;

  @Expose()
  @Type(() => ShiftMeOutputDto)
  me?: ShiftMeOutputDto;

  @Expose()
  @Type(() => ActivityOutputDto)
  activity: ActivityOutputDto;
}

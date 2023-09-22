import { ContactOutputDto } from '@app/contact/dtos';
import { LocationOutputDto } from '@app/location/dtos';
import { Expose, Transform, Type } from 'class-transformer';
import { ShiftManagerOutputDto } from './shift-manager.output.dto';

import { ActivityOutputDto } from '@app/activity/dtos';
import { ShiftSkillOutputDto } from '@app/shift-skill/dtos';
import { ShiftVolunteerOutputDto } from '@app/shift-volunteer/dtos';
import _ from 'lodash';
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

  @Expose()
  rating?: number;

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

  @Expose()
  @Type(() => ShiftOutputDto)
  overlaps?: ShiftOutputDto[];

  @Expose()
  @Type(() => TravelingConstrainedShiftOutputDto)
  travelingConstrainedShifts?: TravelingConstrainedShiftOutputDto[];
}

export class TravelingConstrainedShiftOutputDto extends ShiftOutputDto {
  @Expose()
  @Transform(({ value }) => _.round(value, 2))
  distanceInMeters: number;

  @Expose()
  @Transform(({ value, obj }) => (value ? value : obj.distanceInMeters / 1000))
  @Transform(({ value }) => _.round(value, 2))
  distanceInKilometers?: number;

  @Expose()
  @Transform(({ value }) => _.round(value, 2))
  durationInSeconds: number;

  @Expose()
  @Transform(({ value, obj }) => (value ? value : obj.durationInSeconds / 3600))
  @Transform(({ value }) => _.round(value, 2))
  durationInHours?: number;

  @Expose()
  @Transform(({ value }) => _.round(value, 2))
  speedInMetersPerSecond: number;

  @Expose()
  @Transform(({ value, obj }) =>
    value ? value : obj.speedInMetersPerSecond * 3.6,
  )
  @Transform(({ value }) => _.round(value, 2))
  speedInKilometersPerHour?: number;
}

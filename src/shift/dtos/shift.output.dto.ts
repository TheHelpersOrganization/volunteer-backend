import { Expose, Type } from 'class-transformer';
import { ContactOutputDto } from 'src/contact/dtos';
import { LocationOutputDto } from 'src/location/dtos';
import { ShiftManagerOutputDto } from './shift-manager.output.dto';

import { ShiftVolunteerOutputDto } from 'src/shift-volunteer/dtos';
import { ShiftSkillOutputDto } from './shift-skill.output.dto';

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
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  numberOfParticipants: number;

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
}

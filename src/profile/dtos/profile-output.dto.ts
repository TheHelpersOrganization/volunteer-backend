import { Expose, Type } from 'class-transformer';

import { ShiftSkillOutputDto } from 'src/shift/dtos';
import { LocationOutputDto } from '../../location/dtos';
import { Gender } from '../constants/profile.constant';

export class ProfileOutputDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  gender: Gender;

  @Expose()
  bio: string;

  @Expose()
  @Type(() => LocationOutputDto)
  location: LocationOutputDto;

  @Expose()
  avatarId: number;

  // ----- Extra fields -----

  @Expose()
  @Type(() => ShiftSkillOutputDto)
  skills: ShiftSkillOutputDto[];

  @Expose()
  interestedSkills: number[];
}

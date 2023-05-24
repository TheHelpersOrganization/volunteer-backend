import { Expose, Type } from 'class-transformer';

import { SkillOutputDto } from 'src/skill/dtos';
import { LocationOutputDto } from '../../location/dtos';
import { Gender } from '../constants/profile.constant';
import { ProfileSkillOutputDto } from './profile-skill.output.dto';

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
  @Type(() => ProfileSkillOutputDto)
  skills?: ProfileSkillOutputDto[];

  @Expose()
  @Type(() => SkillOutputDto)
  interestedSkills?: SkillOutputDto[];
}

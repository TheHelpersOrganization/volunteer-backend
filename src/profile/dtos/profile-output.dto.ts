import { Expose } from 'class-transformer';

import { Gender } from '../constants/profile.constant';

export class ProfileOutputDto {
  @Expose()
  username: string;

  @Expose()
  telephoneNumber: string;

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
}

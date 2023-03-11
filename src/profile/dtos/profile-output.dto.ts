import { Expose } from 'class-transformer';

import { Gender } from '../constants/profile.constant';

export class ProfileOutputDto {
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
  addressLine1: string;

  @Expose()
  addressLine2: string;
}

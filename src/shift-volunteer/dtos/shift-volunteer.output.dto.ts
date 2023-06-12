import { Expose, Type } from 'class-transformer';
import { ProfileOutputDto } from 'src/profile/dtos';
import { ShiftVolunteerStatus } from '../constants';

export class ShiftVolunteerOutputDto {
  @Expose()
  id: number;

  @Expose()
  shiftId: number;

  @Expose()
  accountId: number;

  @Expose()
  attendant: boolean;

  @Expose()
  completion: number;

  @Expose()
  status: ShiftVolunteerStatus;

  @Expose()
  @Type(() => ProfileOutputDto)
  profile?: ProfileOutputDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

import { Expose, Type } from 'class-transformer';
import { ErrorObject } from 'src/common/dtos';
import { ProfileOutputDto } from 'src/profile/dtos';
import { ShiftOutputDto } from 'src/shift/dtos';
import { ShiftVolunteerStatus } from '../constants';

export class ShiftVolunteerOutputDto {
  @Expose()
  id: number;

  @Expose()
  shiftId: number;

  @Expose()
  accountId: number;

  @Expose()
  status: ShiftVolunteerStatus;

  @Expose()
  active: boolean;

  @Expose()
  meetSkillRequirements?: boolean;

  @Expose()
  checkedIn?: boolean;

  @Expose()
  checkInAt?: Date;

  @Expose()
  checkOutAt?: Date;

  @Expose()
  checkedOut?: boolean;

  @Expose()
  isCheckInVerified?: boolean;

  @Expose()
  isCheckOutVerified?: boolean;

  @Expose()
  checkInOutVerifierId?: number;

  // @Expose()
  // attendant: boolean;

  @Expose()
  completion?: number;

  @Expose()
  reviewNote?: string;

  @Expose()
  reviewerId?: number;

  @Expose()
  @Type(() => ProfileOutputDto)
  profile?: ProfileOutputDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // ----- Extra fields ----- //

  @Expose()
  @Type(() => ShiftOutputDto)
  shift?: ShiftOutputDto;
}

export class ShiftVolunteerErrorOutputDto {
  @Expose()
  id?: number;

  @Expose()
  @Type(() => ErrorObject)
  error: ErrorObject;
}

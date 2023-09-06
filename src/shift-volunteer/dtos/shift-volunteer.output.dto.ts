import { ErrorObject } from '@app/common/dtos';
import { ProfileOutputDto } from '@app/profile/dtos';
import { ShiftOutputDto } from '@app/shift/dtos';
import { Expose, Transform, Type } from 'class-transformer';
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

  @Transform(({ value, obj }) => {
    return (obj.isCheckInVerified && obj.isCheckOutVerified) || value || false;
  })
  @Expose()
  attendant: boolean;

  @Expose()
  completion?: number;

  @Expose()
  reviewNote?: string;

  @Expose()
  reviewerId?: number;

  @Expose()
  shiftRating?: number;

  @Expose()
  shiftRatingComment?: string;

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

  @Expose()
  hasOverlappingShift?: boolean;

  @Expose()
  hasTravelingConstrainedShift?: boolean;
}

export class ShiftVolunteerErrorOutputDto {
  @Expose()
  id?: number;

  @Expose()
  @Type(() => ErrorObject)
  error: ErrorObject;
}

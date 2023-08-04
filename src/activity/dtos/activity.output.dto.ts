import { ContactOutputDto } from '@app/contact/dtos';
import { ShortLocationOutputDto } from '@app/location/dtos';
import { Expose, Type } from 'class-transformer';
import { ActivityStatus } from '../constants';

export class ActivityMeOutputDto {
  @Expose()
  isManager?: boolean;

  @Expose()
  isShiftManager?: boolean;

  @Expose()
  shiftManagerCount?: number;
}

export class ActivityOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  isDisabled: boolean;

  @Expose()
  status: ActivityStatus;

  @Expose()
  description: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  thumbnail: number;

  @Expose()
  organizationId: number;

  @Expose()
  skillIds: number[];

  @Expose()
  activityManagerIds: number[];

  // ---- Computed fields ----

  @Expose()
  @Type(() => ShortLocationOutputDto)
  location: ShortLocationOutputDto;

  @Expose()
  @Type(() => ContactOutputDto)
  contacts: ContactOutputDto[];

  @Expose()
  maxParticipants: number;

  @Expose()
  joinedParticipants: number;

  @Expose()
  @Type(() => ActivityMeOutputDto)
  me?: ActivityMeOutputDto;
}

export class MonthlyActivityCountOutputDto {
  @Expose()
  month: number;

  @Expose()
  year: number;

  @Expose()
  count: number;
}

export class CountActivityOutputDto {
  @Expose()
  total: number;

  @Expose()
  @Type(() => MonthlyActivityCountOutputDto)
  monthly: MonthlyActivityCountOutputDto[];
}

export class ActivityQueryOutputDto {
  @Expose()
  name?: string;

  // Start date range
  @Expose()
  startTime?: Date[];

  // End date range
  @Expose()
  endTime?: Date[];

  @Expose()
  skill?: number[];

  @Expose()
  org?: number[];

  @Expose()
  locality?: string;

  @Expose()
  region?: string;

  @Expose()
  country?: string;

  @Expose()
  lat?: number;

  @Expose()
  lng?: number;

  @Expose()
  radius?: number;

  @Expose()
  accountId: number;

  @Expose()
  createdAt: Date;
}

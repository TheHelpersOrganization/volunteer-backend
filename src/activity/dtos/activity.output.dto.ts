import { Expose, Type } from 'class-transformer';
import { ContactOutputDto } from 'src/contact/dtos';
import { ShortLocationOutputDto } from 'src/location/dtos';
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

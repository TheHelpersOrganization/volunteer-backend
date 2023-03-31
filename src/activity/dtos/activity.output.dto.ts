import { Expose } from 'class-transformer';
import { ShortLocationOutputDto } from 'src/location/dtos';

export class ActivityOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  thumbnail: number;

  @Expose()
  organizationId: number;

  @Expose()
  activityTypeIds: number[];

  @Expose()
  activityManagerIds: number[];

  // ---- Computed fields ----

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  location: ShortLocationOutputDto;

  @Expose()
  maxParticipants: number;

  @Expose()
  joinedParticipants: number;
}

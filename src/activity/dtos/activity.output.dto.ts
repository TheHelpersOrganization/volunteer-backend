import { Expose, Type } from 'class-transformer';
import { ContactOutputDto } from 'src/contact/dtos';
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
  skillIds: number[];

  @Expose()
  activityManagerIds: number[];

  // ---- Computed fields ----

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

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
}

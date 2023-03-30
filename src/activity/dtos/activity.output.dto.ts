import { Expose } from 'class-transformer';

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
}

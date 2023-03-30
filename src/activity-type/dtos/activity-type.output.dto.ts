import { Expose } from 'class-transformer';

export class ActivityTypeOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;
}

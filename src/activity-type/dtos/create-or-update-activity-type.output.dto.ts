import { Expose } from 'class-transformer';

export class CreateOrUpdateActivityTypeOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;
}

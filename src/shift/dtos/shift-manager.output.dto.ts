import { Expose } from 'class-transformer';

export class ShiftManagerOutputDto {
  @Expose()
  accountId: number;

  @Expose()
  name: string;

  @Expose()
  description: string;
}

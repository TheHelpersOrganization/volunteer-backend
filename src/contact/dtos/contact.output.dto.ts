import { Expose } from 'class-transformer';

export class ContactOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  name: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  email: string;
}

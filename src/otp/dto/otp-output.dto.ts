import { Expose } from 'class-transformer';

export class OtpOutputDto {
  @Expose()
  token: string;
}

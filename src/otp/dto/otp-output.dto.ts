import { Expose } from 'class-transformer';

export class OtpOutputDto {
  @Expose()
  successful: boolean;
}

import { IsString } from 'class-validator';

export class ResetPasswordInputDto {
  @IsString()
  token: string;
}

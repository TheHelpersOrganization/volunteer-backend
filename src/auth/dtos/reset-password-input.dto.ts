import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@app/account/constants';
import { IsString, Length, MaxLength } from 'class-validator';
import { RESET_PASSWORD_TOKEN_MAX_LENGTH } from '../constants';

export class ResetPasswordRequestInputDto {
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;
}

export class VerifyResetPasswordTokenInputDto {
  @IsString()
  @MaxLength(RESET_PASSWORD_TOKEN_MAX_LENGTH)
  token: string;

  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;
}

export class ResetPasswordInputDto {
  @IsString()
  @MaxLength(RESET_PASSWORD_TOKEN_MAX_LENGTH)
  token: string;

  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  password: string;
}

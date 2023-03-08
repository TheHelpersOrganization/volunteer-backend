import { plainToClass } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

import { Environment } from '../constants';

class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  APP_ENV = Environment.Development;

  @IsNumber()
  APP_PORT: number;

  @IsString()
  AUTH_SECRET: string;

  @IsOptional()
  @IsString()
  @IsBooleanString()
  AUTH_DISABLED: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASS: string;

  @IsNumber()
  AUTH_ACCESS_TOKEN_LIFE_SEC: number;

  @IsNumber()
  AUTH_REFRESH_TOKEN_LIFE_SEC: number;

  @IsNumber()
  OTP_LIFE_SEC: number;

  @IsNumber()
  OTP_PASSWORD_RESET_RENEWAL_SEC: number;

  @IsNumber()
  OTP_EMAIL_VERIFICATION_RENEWAL_SEC: number;

  @IsString()
  EMAIL_HOST: string;

  @IsNumber()
  EMAIL_PORT: number;

  @IsString()
  EMAIL_USER: string;

  @IsString()
  EMAIL_PASSWORD: string;

  @IsString()
  @IsOptional()
  EMAIL_DEFAULT_FROM: string;

  @IsUrl()
  FILE_ENDPOINT: string;

  @IsString()
  FILE_REGION: string;

  @IsString()
  FILE_ACCESS_KEY: string;

  @IsString()
  FILE_SECRET_KEY: string;

  @IsString()
  FILE_BUCKET: string;
}

export function validate(config: Record<string, unknown>): any {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

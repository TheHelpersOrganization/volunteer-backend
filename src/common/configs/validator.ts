import { plainToClass } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
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
  JWT_ACCESS_TOKEN_EXP_IN_SEC: number;

  @IsNumber()
  JWT_REFRESH_TOKEN_EXP_IN_SEC: number;
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

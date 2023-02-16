import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from 'src/account/constants/account.constant';

import { ROLE } from '../constants/role.constant';

export class RegisterInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  @IsString()
  password: string;

  // These keys can only be set by ADMIN user.
  roles: ROLE[] = [ROLE.USER];
  isAccountDisabled: boolean;
}

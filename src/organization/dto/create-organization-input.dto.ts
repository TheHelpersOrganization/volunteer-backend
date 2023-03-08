import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { DESCRIPTION_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../constants';

export class CreateOrganizationInputDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsUrl()
  website: string;
}

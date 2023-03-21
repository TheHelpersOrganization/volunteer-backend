import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  Matches,
  MaxLength,
} from 'class-validator';

import { NAME_MAX_LENGTH, NAME_REGEX } from '../../profile/constants';

export class UpdateContactInputDto {
  @IsOptional()
  @Matches(NAME_REGEX)
  @MaxLength(NAME_MAX_LENGTH)
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  email: string;
}

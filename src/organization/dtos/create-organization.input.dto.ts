import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsFileId } from 'src/file/validators';
import { NAME_MAX_LENGTH, NAME_REGEX } from 'src/profile/constants';

import { DESCRIPTION_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../constants';

export class CreateOrganizationInputDto {
  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  @Matches(NAME_REGEX)
  name: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description: string;

  @IsUrl()
  website: string;

  @IsFileId()
  logo: number;

  @IsOptional()
  @IsFileId()
  banner: number;

  @IsNumber(undefined, { each: true })
  locations: number[];

  @IsArray()
  @IsFileId({ each: true })
  files: number[];

  @IsNumber(undefined, { each: true })
  contacts: number[];
}

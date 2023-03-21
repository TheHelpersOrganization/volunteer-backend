import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';

import {
  CreateContactInputDto,
  UpdateContactInputDto,
} from '../../contact/dtos';
import { IsFileId } from '../../file/validators';
import {
  CreateLocationInputDto,
  UpdateLocationInputDto,
} from '../../location/dtos';
import { NAME_MAX_LENGTH, NAME_REGEX } from '../../profile/constants';
import { DESCRIPTION_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../constants';

export class UpdateOrganizationInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(NAME_MAX_LENGTH)
  @Matches(NAME_REGEX)
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsFileId()
  logo?: number;

  @IsOptional()
  @IsOptional()
  @IsFileId()
  banner?: number;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  locations: number[];

  @IsOptional()
  @IsArray()
  @IsFileId({ each: true })
  files: number[];

  @IsOptional()
  @IsNumber(undefined, { each: true })
  contacts: number[];
}

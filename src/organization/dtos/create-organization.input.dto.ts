import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsFileId } from 'src/file/validators';
import { NAME_MAX_LENGTH, NAME_REGEX } from 'src/profile/constants';

import { CreateContactInputDto } from '../../contact/dtos';
import { CreateLocationInputDto } from '../../location/dtos';
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

  @ValidateNested({ each: true })
  @Type(() => CreateLocationInputDto)
  @ArrayNotEmpty()
  locations: CreateLocationInputDto[];

  @IsArray()
  @IsFileId({ each: true })
  files: number[];

  @Type(() => CreateContactInputDto)
  @IsArray()
  @ValidateNested({ each: true })
  contacts: CreateContactInputDto[];
}

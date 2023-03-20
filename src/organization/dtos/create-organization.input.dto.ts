import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsFileId } from 'src/file/validators';
import { NAME_MAX_LENGTH, NAME_REGEX } from 'src/profile/constants';

import { ContactInputDto } from '../../contact/dtos';
import { LocationInputDto } from '../../location/dtos';
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

  @Type(() => LocationInputDto)
  @IsArray()
  @ValidateNested({ each: true })
  locations: LocationInputDto[];

  @IsArray()
  @IsFileId({ each: true })
  files: number[];

  @Type(() => ContactInputDto)
  @IsArray()
  @ValidateNested({ each: true })
  contacts: ContactInputDto[];
}

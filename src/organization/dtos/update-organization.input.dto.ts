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
  UpdateContactInputDto,
  UpdateContactInputWithIdDto,
} from '../../contact/dtos';
import { IsFileId } from '../../file/validators';
import {
  UpdateLocationInputDto,
  UpdateLocationInputDtoWithIdDto,
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
  @IsFileId()
  banner?: number;

  @IsOptional()
  @Type(() => UpdateLocationInputDto)
  @IsArray()
  @ValidateNested({ each: true })
  locations: UpdateLocationInputDtoWithIdDto[];

  @IsOptional()
  @IsArray()
  @IsFileId({ each: true })
  files: number[];

  @IsOptional()
  @Type(() => UpdateContactInputDto)
  @IsArray()
  @ValidateNested({ each: true })
  contacts: UpdateContactInputWithIdDto[];
}

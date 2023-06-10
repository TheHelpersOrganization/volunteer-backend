import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

export enum GetProfileInclude {
  INTERESTED_SKILLS = 'interested-skills',
  SKILLS = 'skills',
}

export enum GetProfileSelect {
  Email = 'email',
  Username = 'username',
  FullName = 'full-name',
  PhoneNumber = 'phone-number',
  DateOfBirth = 'date-of-birth',
  Gender = 'gender',
  Bio = 'bio',
  Avatar = 'avatar',
  Location = 'location',
}

export const getProfileBasicSelect = [
  GetProfileSelect.Email,
  GetProfileSelect.Username,
  GetProfileSelect.FullName,
  GetProfileSelect.Avatar,
];

export class GetProfileQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetProfileInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  includes?: GetProfileInclude[];

  @IsOptional()
  @IsArray()
  @IsEnum(GetProfileSelect, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  select?: GetProfileSelect[];
}

export class GetProfilesQueryDto extends GetProfileQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}

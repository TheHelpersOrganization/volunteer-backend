import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

export enum GetProfileInclude {
  INTERESTED_SKILLS = 'interested-skills',
  SKILLS = 'skills',
}

export class GetProfileQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetProfileInclude, { each: true })
  @Transform(({ value }) => value.split(',').filter((v) => v))
  includes?: GetProfileInclude[];
}

export class GetProfilesQueryDto extends GetProfileQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(Number))
  ids?: number[];
}

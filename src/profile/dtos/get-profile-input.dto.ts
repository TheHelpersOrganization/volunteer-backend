import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dtos';

export enum GetProfileInclude {
  InterestedSkills = 'interested-skills',
  Skills = 'skills',
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
  ids?: number[];
}

import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

import { PaginationParamsDto } from '../../common/dtos';

export enum GetOrganizationQueryInclude {
  Locations = 'locations',
  Contacts = 'contacts',
}

export class GetOrganizationQueryDto extends PaginationParamsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(GetOrganizationQueryInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  includes?: GetOrganizationQueryInclude[];
}

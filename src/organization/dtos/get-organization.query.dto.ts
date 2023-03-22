import { IsOptional } from 'class-validator';

import { PaginationParamsDto } from '../../common/dtos';

export class OrganizationQueryDto extends PaginationParamsDto {
  @IsOptional()
  name?: string;
}

import { PartialType } from '@nestjs/swagger';

import { UpdateLocationInputDto } from '../../location/dtos';
import { CreateOrganizationInputDto } from './create-organization.input.dto';

export class UpdateOrganizationInputDto extends PartialType(
  CreateOrganizationInputDto,
) {
  locations?: UpdateLocationInputDto[];
}

import { PartialType } from '@nestjs/swagger';

import { CreateLocationInputDto } from './create-location-input.dto';

export class UpdateLocationInputDto extends PartialType(
  CreateLocationInputDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { LocationInputDto } from './location-input.dto';

export class UpdateLocationInputDto extends PartialType(LocationInputDto) {
  @IsOptional()
  @IsNumber()
  id: number;
}

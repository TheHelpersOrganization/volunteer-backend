import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateAccountInput {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @Length(6, 100)
  @IsString()
  password: string;
}

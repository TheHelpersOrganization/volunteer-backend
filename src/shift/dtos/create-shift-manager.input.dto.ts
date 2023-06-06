import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateShiftManagerInputDto {
  @IsNumber()
  accountId: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

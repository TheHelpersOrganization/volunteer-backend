import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateShiftManagerInputDto {
  @IsNumber()
  accountId: number;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(2000)
  description: string;
}

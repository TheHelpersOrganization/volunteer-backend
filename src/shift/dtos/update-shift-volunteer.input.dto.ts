import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateShiftVolunteerInputDto {
  @IsOptional()
  @IsBoolean()
  attendant: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completion: number;
}

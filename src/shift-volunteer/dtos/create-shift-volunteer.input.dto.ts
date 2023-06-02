import { IsBoolean, IsNumber, Max, Min } from 'class-validator';

export class CreateShiftVolunteerInputDto {
  @IsNumber()
  @Min(1)
  accountId: number;

  @IsBoolean()
  attendant: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  completion: number;
}

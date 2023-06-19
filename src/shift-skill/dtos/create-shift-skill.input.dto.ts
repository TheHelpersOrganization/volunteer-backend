import { IsNumber, Max, Min } from 'class-validator';

export class CreateShiftSkillInputDto {
  @IsNumber()
  @Min(0)
  @Max(24)
  hours: number;

  @IsNumber()
  skillId: number;
}

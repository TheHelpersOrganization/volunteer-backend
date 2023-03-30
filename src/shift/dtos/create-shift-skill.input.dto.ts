import { IsNumber } from 'class-validator';

export class CreateShiftSkillInputDto {
  @IsNumber()
  hours: number;

  @IsNumber()
  skillId: number;
}

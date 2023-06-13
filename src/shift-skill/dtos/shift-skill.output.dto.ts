import { Expose, Type } from 'class-transformer';
import { SkillOutputDto } from 'src/skill/dtos';

export class ShiftSkillOutputDto {
  @Expose()
  hours: number;

  @Expose()
  skillId: number;

  @Expose()
  @Type(() => SkillOutputDto)
  skill: SkillOutputDto;
}

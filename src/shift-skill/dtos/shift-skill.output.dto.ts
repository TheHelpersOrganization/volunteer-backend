import { SkillOutputDto } from '@app/skill/dtos';
import { Expose, Type } from 'class-transformer';

export class ShiftSkillOutputDto {
  @Expose()
  hours: number;

  @Expose()
  skillId: number;

  @Expose()
  @Type(() => SkillOutputDto)
  skill: SkillOutputDto;
}

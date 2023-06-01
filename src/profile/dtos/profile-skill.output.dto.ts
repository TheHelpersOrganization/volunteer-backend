import { Expose } from 'class-transformer';
import { SkillOutputDto } from 'src/skill/dtos';

export class ProfileSkillOutputDto extends SkillOutputDto {
  @Expose()
  hours: number;
}

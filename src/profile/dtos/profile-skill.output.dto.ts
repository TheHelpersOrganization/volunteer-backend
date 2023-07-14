import { Expose, Transform } from 'class-transformer';
import * as _ from 'lodash';
import { SkillOutputDto } from 'src/skill/dtos';

export class ProfileSkillOutputDto extends SkillOutputDto {
  @Expose()
  @Transform(({ value }) => _.round(value, 1))
  hours: number;
}

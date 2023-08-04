import { SkillOutputDto } from '@app/skill/dtos';
import { Expose, Transform } from 'class-transformer';
import _ from 'lodash';

export class ProfileSkillOutputDto extends SkillOutputDto {
  @Expose()
  @Transform(({ value }) => _.round(value, 1))
  hours: number;
}

import { Expose } from 'class-transformer';

export class SkillOutputDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;
}

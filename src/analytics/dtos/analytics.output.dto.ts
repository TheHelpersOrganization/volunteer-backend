import { ProfileOutputDto } from '@app/profile/dtos';
import { Expose, Transform } from 'class-transformer';
import _ from 'lodash';

export class AccountRankingOutputDto extends ProfileOutputDto {
  @Expose()
  @Transform(({ value }) => _.round(value, 1))
  hoursContributed: number;
}

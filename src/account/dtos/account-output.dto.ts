import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ROLE } from '../../auth/constants/role.constant';

export class AccountOutput {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ example: [ROLE.USER] })
  roles: ROLE[];

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  isAccountDisabled: boolean;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}

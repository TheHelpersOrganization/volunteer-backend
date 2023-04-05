import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Role } from '../../auth/constants/role.constant';

export class AccountOutputDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ example: [Role.Volunteer] })
  roles: Role[];

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  isAccountDisabled: boolean;

  @Expose()
  @ApiProperty()
  isAccountVerified: boolean;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}

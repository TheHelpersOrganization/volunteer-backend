import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { AccountVerificationOutputDto } from 'src/account-verification/dtos';
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
  createdAt?: Date;

  @Expose()
  @ApiProperty()
  updatedAt?: Date;

  // ----- Extra fields -----

  @Expose()
  @Type(() => AccountVerificationOutputDto)
  @ApiProperty()
  verificationList?: AccountVerificationOutputDto[];

  @Expose()
  @Type(() => AccountBanOutputDto)
  @ApiProperty()
  banList?: AccountBanOutputDto[];
}

export class AccountBanOutputDto {
  @Expose()
  @ApiProperty()
  performedBy: number;

  @Expose()
  @ApiProperty()
  isBanned: boolean;

  @Expose()
  @ApiProperty()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}

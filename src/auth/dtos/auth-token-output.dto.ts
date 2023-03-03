import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AccountOutputDto } from 'src/account/dtos';

import { ROLE } from '../constants/role.constant';

export class AuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;

  @Expose()
  account: AccountOutputDto;
}

export class AccountAccessTokenClaims {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  roles: ROLE[];
}

export class AccountRefreshTokenClaims {
  id: number;
}

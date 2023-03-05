import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AccountOutputDto } from 'src/account/dtos';

import { ROLE } from '../constants/role.constant';
import { TokenOutputDto } from './token-output.dto';

export class AccountTokenOutputDto {
  @Expose()
  token: TokenOutputDto;

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

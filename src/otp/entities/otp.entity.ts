import { Account } from '../../account/entities';
import { OtpType } from '../constants';

export class Otp {
  accountId: number;

  account: Account;

  type: OtpType;

  token: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;
}

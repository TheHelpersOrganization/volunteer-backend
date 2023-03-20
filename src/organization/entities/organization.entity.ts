import { Account } from '../../account/entities';
import { File } from '../../file/entities';

export class Organization {
  id: number;

  name: string;

  phoneNumber: string;

  email: string;

  description: string;

  website: string;

  isVerified: boolean;

  isDisabled: boolean;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;

  logoId: number;

  logo: File;

  bannerId: number;

  banner: File;

  ownerId: number;

  owner: Account;
}

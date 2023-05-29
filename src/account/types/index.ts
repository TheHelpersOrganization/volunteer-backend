import {
  Account,
  AccountBan,
  AccountRole,
  AccountVerification,
  Role,
} from '@prisma/client';

export type RawExtendedAccount = Account & {
  accountVerification?: AccountVerification[];
  accountBan?: AccountBan[];
  accountRoles: (AccountRole & { role: Role })[];
};

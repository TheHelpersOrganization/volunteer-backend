import { GetAccountIncludes } from '@app/account/dtos';
import {
  UnableToBanSelfAccountException,
  UnableToVerifySelfAccountException,
} from '@app/account/exceptions';
import { Role } from '@app/auth/constants';
import { AccountNotFoundException } from '@app/auth/exceptions/account-not-found.exception';
import { CommonModule } from '@app/common/common.module';
import { RequestContext } from '@app/common/request-context';
import { throwIfNullish } from '@app/common/utils';
import { AppPrismaClient, PrismaModule } from '@app/prisma';
import { Test } from '@nestjs/testing';
import { Account } from '@prisma/client';
import { nanoid } from 'nanoid';
import { AccountService } from '../account.service';
import { AdminAccountService } from '../admin-account.service';

describe('AdminAccountService', () => {
  let prismaClient: AppPrismaClient;
  let service: AdminAccountService;
  const adminContext = new RequestContext();
  let adminAccount: Account;
  let volunteerAccount1: Account;
  let volunteerAccount2: Account;

  beforeAll(async () => {
    prismaClient = new AppPrismaClient();
    await prismaClient.connect();
    await prismaClient.deleteAllData();

    adminAccount = await prismaClient.account.create({
      data: {
        email: nanoid() + '@example.com',
        password: '123456',
      },
    });
    adminContext.account = { ...adminAccount, roles: [Role.Admin] };

    volunteerAccount1 = await prismaClient.account.create({
      data: {
        email: nanoid() + '@example.com',
        password: '123456',
      },
    });

    volunteerAccount2 = await prismaClient.account.create({
      data: {
        email: nanoid() + '@example.com',
        password: '123456',
      },
    });

    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule],
      providers: [AccountService, AdminAccountService],
    }).compile();

    service = moduleRef.get(AdminAccountService);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get accounts', () => {
    it('should get successfully', async () => {
      const accounts = await service.getAccounts(adminContext, {});
      expect(accounts.length).toBe(3);
    });

    it('should get successfully with includes', async () => {
      const accounts = await service.getAccounts(adminContext, {
        includes: [
          GetAccountIncludes.VerificationList,
          GetAccountIncludes.BanList,
        ],
      });
      expect(accounts?.[0].verificationList).toBeDefined();
      expect(accounts?.[0].banList).toBeDefined();
    });

    it('should get successfully with query', async () => {
      const accounts = await service.getAccounts(adminContext, {
        isBanned: false,
      });
      expect(accounts.length).toBe(3);
    });

    it('should get successfully with query 2', async () => {
      const accounts = await service.getAccounts(adminContext, {
        email: adminAccount.email,
      });
      expect(accounts.length).toBe(1);
    });

    it('should get successfully with query 3', async () => {
      const accounts = await service.getAccounts(adminContext, {
        createdAt: [throwIfNullish(volunteerAccount2.createdAt), new Date()],
      });
      expect(accounts.length).toBe(1);
    });

    it('should get successfully with query 4', async () => {
      const accounts = await service.getAccounts(adminContext, {
        email: volunteerAccount1.email,
        createdAt: [throwIfNullish(volunteerAccount2.createdAt), new Date()],
      });
      expect(accounts.length).toBe(0);
    });

    it('should get successfully with query 5', async () => {
      const accounts = await service.getAccounts(adminContext, {
        email: volunteerAccount2.email,
        isVerified: false,
        createdAt: [throwIfNullish(volunteerAccount2.createdAt), new Date()],
      });
      expect(accounts.length).toBe(1);
    });
  });

  describe('verify account', () => {
    it('should verify successfully', async () => {
      const account = await service.verifyAccount(
        adminContext,
        volunteerAccount1.id,
        {
          isVerified: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );

      expect(account.isAccountVerified).toBe(true);
      expect(account.verificationList?.length).toBe(1);
      expect(account.verificationList?.[0]).toMatchObject({
        isVerified: true,
        note: 'test',
        performedBy: adminContext.account.id,
      });
      expect(account.banList?.length).toBe(0);
    });

    it('should throw if verify non-exist account', async () => {
      const verifyPromise = service.verifyAccount(
        adminContext,
        999,
        {
          isVerified: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );
      await expect(verifyPromise).rejects.toThrow(AccountNotFoundException);
    });

    it('should throw if verify self', async () => {
      const verifyPromise = service.verifyAccount(
        adminContext,
        adminAccount.id,
        {
          isVerified: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );
      await expect(verifyPromise).rejects.toThrow(
        UnableToVerifySelfAccountException,
      );
    });
  });

  describe('ban account', () => {
    it('should ban successfully', async () => {
      const account = await service.banAccount(
        adminContext,
        volunteerAccount1.id,
        {
          isBanned: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );

      expect(account.isAccountDisabled).toBe(true);
      expect(account.banList?.length).toBe(1);
      expect(account.banList?.[0]).toMatchObject({
        isBanned: true,
        note: 'test',
        performedBy: adminContext.account.id,
      });
    });

    it('should throw if ban non-exist account', async () => {
      const banPromise = service.banAccount(
        adminContext,
        999,
        {
          isBanned: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );
      await expect(banPromise).rejects.toThrow(AccountNotFoundException);
    });

    it('should throw if ban self', async () => {
      const banPromise = service.banAccount(
        adminContext,
        adminAccount.id,
        {
          isBanned: true,
          note: 'test',
        },
        {
          includes: [
            GetAccountIncludes.VerificationList,
            GetAccountIncludes.BanList,
          ],
        },
      );
      await expect(banPromise).rejects.toThrow(UnableToBanSelfAccountException);
    });
  });
});

import { AccountVerificationStatus } from '@app/account-verification/constants';
import {
  AccountVerificationIsBlockedException,
  NoPendingAccountVerificationException,
  UnableToVerifySelfAccountException,
} from '@app/account-verification/exceptions';
import { Role } from '@app/auth/constants';
import { AccountNotFoundException } from '@app/auth/exceptions/account-not-found.exception';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  AccountOutputDto,
  AdminAccountBanInputDto,
  AdminAccountVerifyInputDto,
  BaseAccountQueryDto,
  GetAccountIncludes,
  GetAccountQueryDto,
} from '../dtos';
import { UnableToBanSelfAccountException } from '../exceptions';
import { RawExtendedAccount } from '../types';

@Injectable()
export class AdminAccountService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async getAccounts(
    ctx: RequestContext,
    query: GetAccountQueryDto,
  ): Promise<AccountOutputDto[]> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    const where: Prisma.AccountWhereInput | undefined = {};
    if (query?.ids) {
      where.id = { in: query.ids };
    }
    where.isAccountVerified = query?.isVerified;
    where.isAccountDisabled = query?.isBanned;
    where.email = query?.email ? { contains: query.email } : undefined;
    if (query.createdAt) {
      where.createdAt = {
        gte: query.createdAt[0],
        lte: query.createdAt[1],
      };
    }
    const includeVerificationList = query.includes?.includes(
      GetAccountIncludes.VerificationList,
    );
    const includeBanList = query.includes?.includes(GetAccountIncludes.BanList);

    const accounts = await this.prisma.account.findMany({
      where: where,
      include: {
        accountVerification: includeVerificationList,
        accountBan: includeBanList,
      },
      take: query.limit,
      skip: query.offset,
    });

    const mapped: AccountOutputDto[] = accounts.map((account) => {
      const res: any = account;

      if (account.accountVerification) {
        res.verificationList = account.accountVerification;
      }
      if (account.accountBan) {
        res.banList = account.accountBan;
      }

      return res;
    });

    const output = plainToInstance(AccountOutputDto, mapped, {
      excludeExtraneousValues: true,
    });

    return output;
  }

  async verifyAccount(
    context: RequestContext,
    id: number,
    dto: AdminAccountVerifyInputDto,
    query: BaseAccountQueryDto,
  ) {
    const performedBy = context.account.id;
    const account = await this.prisma.account.findUnique({
      where: {
        id: id,
      },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }
    if (account.id === performedBy) {
      throw new UnableToVerifySelfAccountException();
    }

    const verification = await this.prisma.accountVerification.findFirst({
      where: {
        accountId: id,
        status: {
          in: [
            AccountVerificationStatus.Pending,
            AccountVerificationStatus.Blocked,
          ],
        },
      },
    });
    if (!verification) {
      throw new NoPendingAccountVerificationException();
    }
    if (verification.status === AccountVerificationStatus.Blocked) {
      throw new AccountVerificationIsBlockedException();
    }

    const updated = await this.prisma.$transaction(
      async () => {
        await this.prisma.accountVerification.update({
          where: {
            id: verification.id,
          },
          data: {
            performedBy: performedBy,
            isVerified: dto.isVerified,
            note: dto.note,
            status: AccountVerificationStatus.Completed,
          },
        });

        const updated = await this.prisma.account.update({
          where: {
            id,
          },
          data: {
            isAccountVerified: dto.isVerified,
          },
          include: this.getAccountIncludes(query),
        });

        return updated;
      },
      {
        timeout: 10000,
      },
    );

    return this.mapToDto(updated);
  }

  async banAccount(
    context: RequestContext,
    id: number,
    dto: AdminAccountBanInputDto,
    query: BaseAccountQueryDto,
  ) {
    const bannedBy = context.account.id;
    const account = await this.prisma.account.findUnique({
      where: {
        id,
      },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }
    if (account.id === bannedBy) {
      throw new UnableToBanSelfAccountException();
    }

    const updated = await this.prisma.$transaction(
      async () => {
        await this.prisma.accountBan.create({
          data: {
            accountId: id,
            performedBy: bannedBy,
            isBanned: dto.isBanned,
            note: dto.note,
          },
        });
        const updated = await this.prisma.account.update({
          where: {
            id,
          },
          data: {
            isAccountDisabled: dto.isBanned,
          },
          include: this.getAccountIncludes(query),
        });
        return updated;
      },
      {
        timeout: 10000,
      },
    );

    return this.mapToDto(updated);
  }

  getAccountIncludes(query: GetAccountQueryDto) {
    const includeVerificationList =
      query.includes?.includes(GetAccountIncludes.VerificationList) ?? false;
    const includeBanList =
      query.includes?.includes(GetAccountIncludes.BanList) ?? false;
    return {
      accountVerification: includeVerificationList,
      accountBan: includeBanList,
      accountRoles: {
        include: {
          role: true,
        },
      },
    };
  }

  mapToDto(account: RawExtendedAccount): AccountOutputDto {
    const res: any = {
      ...account,
      roles: account.accountRoles.map((ar) => ar.role.name as Role),
    };

    if (account.accountVerification) {
      res.verificationList = account.accountVerification;
    }
    if (account.accountBan) {
      res.banList = account.accountBan;
    }

    return this.output(AccountOutputDto, res);
  }
}

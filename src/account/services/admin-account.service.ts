import { AccountVerificationStatus } from '@app/account-verification/constants';
import {
  AccountVerificationIsBlockedException,
  NoPendingAccountVerificationException,
  UnableToGrantRoleToSelfAccountException,
  UnableToVerifySelfAccountException,
} from '@app/account-verification/exceptions';
import { Role } from '@app/auth/constants';
import { AccountNotFoundException } from '@app/auth/exceptions/account-not-found.exception';
import { CountOutputDto } from '@app/common/dtos/count.dto';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { countGroupByTime } from '@app/common/utils';
import { PrismaService } from '@app/prisma';
import { RoleNotFountException } from '@app/role/exceptions';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  AccountOutputDto,
  AdminAccountBanInputDto,
  AdminAccountVerifyInputDto,
  BaseAccountQueryDto,
  CountAccountQueryDto,
  GetAccountIncludes,
  GetAccountQueryDto,
} from '../dtos';
import { UnableToBanSelfAccountException } from '../exceptions';
import { RawExtendedAccount } from '../types';
import { AccountService } from './account.service';

@Injectable()
export class AdminAccountService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
  ) {
    super(logger);
  }

  async getAccounts(
    ctx: RequestContext,
    query: GetAccountQueryDto,
  ): Promise<AccountOutputDto[]> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    const where = this.getAccountWhere(query);
    const includeVerificationList = query.includes?.includes(
      GetAccountIncludes.VerificationList,
    );
    const includeBanList = query.includes?.includes(GetAccountIncludes.BanList);
    const includeProfile =
      query.includes?.includes(GetAccountIncludes.Profile) == true;
    const include: Prisma.AccountInclude = {
      accountVerification: includeVerificationList,
      accountBan: includeBanList,
    };
    if (includeProfile) {
      include.profile = {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatar: true,
        },
      };
    }

    const accounts = await this.prisma.account.findMany({
      where: where,
      include: include,
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

  async countAccounts(
    ctx: RequestContext,
    query: CountAccountQueryDto,
  ): Promise<CountOutputDto> {
    const conditions: Prisma.Sql[] = [];
    if (query.isBanned != null) {
      conditions.push(Prisma.sql`"isAccountDisabled" = ${query.isBanned}`);
    }
    if (query.isAccountVerified != null) {
      conditions.push(
        Prisma.sql`"isAccountVerified" = ${query.isAccountVerified}`,
      );
    }
    if (query.isEmailVerified != null) {
      conditions.push(Prisma.sql`"isEmailVerified" = ${query.isEmailVerified}`);
    }
    if (query.startTime != null) {
      conditions.push(Prisma.sql`"createdAt" >= ${query.startTime}`);
    }
    if (query.endTime != null) {
      conditions.push(Prisma.sql`"createdAt" <= ${query.endTime}`);
    }
    const sqlWhere =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
    const res: {
      month: Date;
      count: bigint;
    }[] = await this.prisma.$queryRaw`
      SELECT
      DATE_TRUNC('month', "createdAt")
        AS month,
      COUNT(*) AS count
      FROM "Account"
      ${sqlWhere}
      GROUP BY DATE_TRUNC('month',"createdAt");
    `;

    return countGroupByTime(res);
  }

  getAccountWhere(query: GetAccountQueryDto) {
    const where: Prisma.AccountWhereInput | undefined = {};
    if (query?.ids) {
      where.id = { in: query.ids };
    }
    where.isAccountVerified = query?.isVerified;
    where.isAccountDisabled = query?.isBanned;
    where.email = query?.email
      ? { contains: query.email, mode: 'insensitive' }
      : undefined;
    if (query.search) {
      where.OR = [
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          profile: {
            firstName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
        {
          profile: {
            lastName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
        {
          profile: {
            username: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    if (query.role) {
      where.accountRoles = {
        some: {
          role: {
            name: {
              in: query.role,
            },
          },
        },
      };
    }
    if (query.excludeRole) {
      where.accountRoles = {
        none: {
          role: {
            name: {
              in: query.excludeRole,
            },
          },
        },
      };
    }
    if (query.createdAt) {
      where.createdAt = {
        gte: query.createdAt[0],
        lte: query.createdAt[1],
      };
    }
    return where;
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

  async grantAdminRole(context: RequestContext, id: number) {
    this.logCaller(context, this.grantAdminRole);
    const adminRole = await this.prisma.role.findUnique({
      where: {
        name: Role.Admin,
      },
    });
    if (!adminRole) {
      throw new RoleNotFountException();
    }
    const account = await this.prisma.account.findUnique({
      where: {
        id,
      },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }
    if (account.id === context.account.id) {
      throw new UnableToGrantRoleToSelfAccountException();
    }
    const exists = await this.prisma.accountRole.findFirst({
      where: {
        accountId: id,
        roleId: adminRole.id,
      },
    });
    if (exists) {
      return this.accountService.findById(context, id);
    }
    const updated = await this.prisma.accountRole.create({
      data: {
        accountId: id,
        roleId: adminRole.id,
      },
      include: {
        role: true,
      },
    });
    return this.accountService.findById(context, id);
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

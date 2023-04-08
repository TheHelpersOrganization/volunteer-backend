import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { AccountNotFoundException } from 'src/auth/exceptions/account-not-found.exception';
import { EmailAlreadyInUseException } from 'src/auth/exceptions/email-already-in-use.exception';

import { Prisma } from '@prisma/client';
import { Role } from 'src/auth/constants';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAccountQueryDto, UpdateAccountRolesInputDto } from '../dtos';
import { CreateAccountInput } from '../dtos/account-create-input.dto';
import { AccountOutputDto } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AccountService.name);
  }

  async createAccount(
    ctx: RequestContext,
    input: CreateAccountInput,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.createAccount.name} was called`);

    const account = plainToInstance(Account, input);

    const exist = await this.prisma.account.findUnique({
      where: { email: account.email },
    });
    if (exist) {
      throw new EmailAlreadyInUseException();
    }

    account.password = await hash(input.password, 10);
    delete account['roles'];

    this.logger.log(ctx, `creating account`);
    const volunteerRoleId = await this.prisma.role.findMany({
      where: { name: { in: [Role.Volunteer, Role.Moderator] } },
    });
    if (volunteerRoleId.length != 2) {
      throw new InternalServerErrorException('Cannot register account');
    }
    const { id } = await this.prisma.account.create({
      data: {
        ...account,
        accountRole: {
          createMany: {
            data: [
              { roleId: volunteerRoleId[0].id },
              { roleId: volunteerRoleId[1].id },
            ],
          },
        },
      },
    });

    return plainToInstance(
      AccountOutputDto,
      { account, id },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async validateEmailPassword(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.validateEmailPassword.name} was called`);

    this.logger.log(ctx, `find account`);
    const account = await this.prisma.account.findUnique({
      where: { email: email },
      include: {
        accountRole: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(pass, account.password);
    if (!match) throw new AccountNotFoundException();

    const res = {
      ...account,
      roles: account.accountRole.map((r) => r.role.name),
    };
    return plainToInstance(AccountOutputDto, res, {
      excludeExtraneousValues: true,
    });
  }

  async getAccounts(
    ctx: RequestContext,
    limit: number,
    offset: number,
    query?: GetAccountQueryDto,
  ): Promise<{ users: AccountOutputDto[]; count: number }> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    this.logger.log(ctx, `find accounts`);
    const where: Prisma.AccountWhereInput | undefined = {};
    if (query?.ids) {
      where.id = { in: query.ids };
    }
    where.isAccountDisabled = query?.isBanned;

    const accounts = await this.prisma.account.findMany({
      where: where,
      take: limit,
      skip: offset,
    });

    const usersOutput = plainToInstance(AccountOutputDto, accounts, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count: accounts.length };
  }

  async findById(ctx: RequestContext, id: number): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.findById.name} was called`);
    const account = await this.prisma.account.findUnique({
      where: { id: id },
      include: {
        accountRole: {
          include: {
            role: true,
          },
        },
      },
    });
    const res = {
      ...account,
      roles: account?.accountRole.map((r) => r.role.name),
    };

    return plainToInstance(AccountOutputDto, res, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(
    ctx: RequestContext,
    email: string,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);
    const account = await this.prisma.account.findUnique({
      where: { email: email },
    });

    return plainToInstance(AccountOutputDto, account, {
      excludeExtraneousValues: true,
    });
  }

  async updateAccount(
    ctx: RequestContext,
    id: number,
    input: UpdateAccountInput,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.updateAccount.name} was called`);

    this.logger.log(ctx, `find account by email`);
    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });

    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    // merges the input (2nd line) to the found user (1st line)
    const updatedUser: Account = {
      ...account,
      ...plainToInstance(Account, input),
    };

    this.logger.log(ctx, `update account`);
    await this.prisma.account.update({
      where: { id: updatedUser.id },
      data: updatedUser,
    });

    return plainToInstance(AccountOutputDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async markAccountAsVerified(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.markAccountAsVerified.name} was called`);

    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }

    const verifiedAccount = {
      ...account,
      isAccountVerified: true,
    };

    await this.prisma.account.update({
      where: { id: id },
      data: verifiedAccount,
    });

    return plainToInstance(AccountOutputDto, verifiedAccount, {
      excludeExtraneousValues: true,
    });
  }

  async updateAccountRoles(
    ctx: RequestContext,
    id: number,
    dto: UpdateAccountRolesInputDto,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.updateAccountRoles.name} was called`);

    const roles = dto.roles;
    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }

    return plainToInstance(AccountOutputDto, account, {
      excludeExtraneousValues: true,
    });
  }
}

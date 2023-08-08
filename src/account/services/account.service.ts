import { AccountNotFoundException } from '@app/auth/exceptions/account-not-found.exception';
import { EmailAlreadyInUseException } from '@app/auth/exceptions/email-already-in-use.exception';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { Role } from '@app/auth/constants';
import { WrongPasswordException } from '@app/auth/exceptions';
import { AbstractService } from '@app/common/services';
import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAccountRolesInputDto } from '../dtos';
import { CreateAccountInput } from '../dtos/account-create-input.dto';
import { AccountOutputDto } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountService extends AbstractService {
  constructor(
    private prisma: PrismaService,
    logger: AppLogger,
  ) {
    super(logger);
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
    const res = await this.prisma.account.create({
      data: {
        ...account,
        accountRoles: {
          createMany: {
            data: [{ roleId: volunteerRoleId[0].id }],
          },
        },
      },
    });

    const output: AccountOutputDto = {
      ...res,
      roles: [Role.Volunteer],
      createdAt: res.createdAt ?? undefined,
      updatedAt: res.updatedAt ?? undefined,
    };

    return plainToInstance(AccountOutputDto, output, {
      excludeExtraneousValues: true,
    });
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
      include: this.getAccountInclude(),
    });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(pass, account.password);
    if (!match) throw new AccountNotFoundException();

    return this.mapToDto(account);
  }

  async findById(ctx: RequestContext, id: number): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.findById.name} was called`);
    const account = await this.prisma.account.findUnique({
      where: { id: id },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(account);
  }

  async findByEmail(
    ctx: RequestContext,
    email: string,
  ): Promise<AccountOutputDto> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);
    const account = await this.prisma.account.findUnique({
      where: { email: email },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(account);
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
    const updated = await this.prisma.account.update({
      where: { id: updatedUser.id },
      data: updatedUser,
      include: this.getAccountInclude(),
    });

    return this.mapToDto(updated);
  }

  async markAccountAsVerified(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.markAccountAsVerified.name} was called`);

    const account = await this.prisma.account.findUnique({
      where: { id: id },
    });
    if (!account) {
      throw new AccountNotFoundException();
    }

    const updated = await this.prisma.account.update({
      where: { id: id },
      data: {
        isEmailVerified: true,
      },
      include: this.getAccountInclude(),
    });

    return this.mapToDto(updated);
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

  async getAccounts(
    ctx: RequestContext,
    ids: number[],
  ): Promise<AccountOutputDto[]> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    const accounts = await this.prisma.account.findMany({
      where: { id: { in: ids } },
      include: this.getAccountInclude(),
    });

    return accounts.map((account) => {
      return this.mapToDto(account);
    });
  }

  async validateAccountPassword(accountId: number, password: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(password, account.password);
    if (!match) throw new WrongPasswordException();

    return true;
  }

  private getAccountInclude() {
    return {
      accountRoles: {
        include: {
          role: true,
        },
      },
    };
  }

  mapToDto(account: any): AccountOutputDto {
    return this.output(
      AccountOutputDto,
      { ...account, roles: account.accountRoles.map((r) => r.role.name) },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

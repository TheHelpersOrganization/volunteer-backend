import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { AccountNotFoundException } from 'src/auth/exceptions/account-not-found.exception';
import { EmailAlreadyInUseException } from 'src/auth/exceptions/email-already-in-use.exception';

import { AppLogger } from '../../common/logger/logger.service';
import { RequestContext } from '../../common/request-context/request-context.dto';
import { CreateAccountInput } from '../dtos/account-create-input.dto';
import { AccountOutput } from '../dtos/account-output.dto';
import { UpdateAccountInput } from '../dtos/account-update-input.dto';
import { Account } from '../entities/account.entity';
import { AccountRepository } from '../repositories/account.repository';

@Injectable()
export class AccountService {
  constructor(
    private repository: AccountRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AccountService.name);
  }

  async createAccount(
    ctx: RequestContext,
    input: CreateAccountInput,
  ): Promise<AccountOutput> {
    this.logger.log(ctx, `${this.createAccount.name} was called`);

    const account = plainToInstance(Account, input);

    const exist = await this.repository.findOneBy({ email: account.email });
    if (exist) {
      throw new EmailAlreadyInUseException();
    }

    account.password = await hash(input.password, 10);

    this.logger.log(ctx, `calling ${AccountRepository.name}.saveUser`);
    await this.repository.save(account);

    return plainToInstance(AccountOutput, account, {
      excludeExtraneousValues: true,
    });
  }

  async validateEmailPassword(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<AccountOutput> {
    this.logger.log(ctx, `${this.validateEmailPassword.name} was called`);

    this.logger.log(ctx, `calling ${AccountRepository.name}.findOne`);
    const account = await this.repository.findOneBy({ email });
    if (!account) throw new AccountNotFoundException();

    const match = await compare(pass, account.password);
    if (!match) throw new AccountNotFoundException();

    return plainToInstance(AccountOutput, account, {
      excludeExtraneousValues: true,
    });
  }

  async getAccounts(
    ctx: RequestContext,
    limit: number,
    offset: number,
  ): Promise<{ users: AccountOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getAccounts.name} was called`);

    this.logger.log(ctx, `calling ${AccountRepository.name}.findAndCount`);
    const [users, count] = await this.repository.findAndCount({
      where: {},
      take: limit,
      skip: offset,
    });

    const usersOutput = plainToInstance(AccountOutput, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
  }

  async findById(ctx: RequestContext, id: number): Promise<AccountOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);
    const account = await this.repository.findOneBy({ id });

    return plainToInstance(AccountOutput, account, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(
    ctx: RequestContext,
    email: string,
  ): Promise<AccountOutput> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);
    const account = await this.repository.findOneBy({ email });

    return plainToInstance(AccountOutput, account, {
      excludeExtraneousValues: true,
    });
  }

  async updateAccount(
    ctx: RequestContext,
    id: number,
    input: UpdateAccountInput,
  ): Promise<AccountOutput> {
    this.logger.log(ctx, `${this.updateAccount.name} was called`);

    this.logger.log(ctx, `calling ${AccountRepository.name} to find by email`);
    const account = await this.repository.findOneBy({ id });

    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    // merges the input (2nd line) to the found user (1st line)
    const updatedUser: Account = {
      ...account,
      ...plainToInstance(Account, input),
    };

    this.logger.log(ctx, `calling ${AccountRepository.name}.save`);
    await this.repository.save(updatedUser);

    return plainToInstance(AccountOutput, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async markAccountAsVerified(ctx: RequestContext, id: number) {
    this.logger.log(ctx, `${this.markAccountAsVerified.name} was called`);

    const account = await this.repository.findOneBy({ id });
    if (!account) {
      throw new AccountNotFoundException();
    }

    const verifiedAccount: Account = {
      ...account,
      isAccountVerified: true,
    };

    await this.repository.save(verifiedAccount);

    return plainToInstance(AccountOutput, verifiedAccount, {
      excludeExtraneousValues: true,
    });
  }
}

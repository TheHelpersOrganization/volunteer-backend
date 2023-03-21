import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context/request-context.dto';
import { AbstractService } from 'src/common/services';

import { PrismaService } from '../../prisma';
import { ProfileOutputDto, UpdateProfileInputDto } from '../dtos';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileService extends AbstractService {
  constructor(private readonly prisma: PrismaService, logger: AppLogger) {
    super(logger);
    this.logger.setContext(ProfileService.name);
  }

  async getProfile(ctx: RequestContext): Promise<ProfileOutputDto> {
    this.logger.log(ctx, `${this.getProfile.name} was called`);
    const accountId = ctx.account.id;
    this.logger.log(ctx, `calling prisma.profile findOneBy`);
    let profile = await this.prisma.profile.findUnique({
      where: { accountId: accountId },
    });
    this.logger.log(ctx, `account profile does not exist, create one`);
    if (!profile) {
      this.logger.log(ctx, `calling prisma.profile create`);
      profile = await this.prisma.profile.create({
        data: { accountId: accountId },
      });
    }
    return this.output(ProfileOutputDto, profile);
  }

  /**
   * Create or update the account profile
   * @param ctx request context
   * @param input profile input dto
   * @returns
   */
  async updateProfile(
    ctx: RequestContext,
    input: UpdateProfileInputDto,
  ): Promise<ProfileOutputDto> {
    this.logger.log(ctx, `${this.updateProfile.name} was called`);
    const accountId = ctx.account.id;
    this.logger.log(ctx, `calling prisma.profile findOneBy`);
    const profile = await this.prisma.profile.findUnique({
      where: { accountId: accountId },
    });
    const updatedProfile = {
      ...profile,
      ...plainToInstance(Profile, input),
      accountId: accountId,
    };
    this.logger.log(ctx, `calling prisma.profile save`);
    const res = await this.prisma.profile.upsert({
      where: { accountId: accountId },
      create: updatedProfile,
      update: updatedProfile,
    });
    return this.output(ProfileOutputDto, res);
  }
}

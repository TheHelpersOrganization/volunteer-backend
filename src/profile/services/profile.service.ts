import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context/request-context.dto';
import { AbstractService } from 'src/common/services';
import { Repository } from 'typeorm';

import { ProfileOutputDto, UpdateProfileInputDto } from '../dtos';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileService extends AbstractService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    logger: AppLogger,
  ) {
    super(logger);
    this.logger.setContext(ProfileService.name);
  }

  async getProfile(ctx: RequestContext): Promise<ProfileOutputDto> {
    this.logger.log(ctx, `${this.getProfile.name} was called`);
    const accountId = ctx.account.id;
    this.logger.log(ctx, `calling ProfileRepository findOneBy`);
    let profile = await this.profileRepository.findOneBy({
      accountId: accountId,
    });
    this.logger.log(ctx, `account profile does not exist, create one`);
    if (!profile) {
      this.logger.log(ctx, `calling ProfileRepository create`);
      profile = await this.profileRepository.create({ accountId: accountId });
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
    this.logger.log(ctx, `calling ProfileRepository findOneBy`);
    const profile = this.profileRepository.findOneBy({ accountId: accountId });
    const updatedProfile = {
      ...profile,
      ...plainToInstance(Profile, input),
      accountId: accountId,
    };
    this.logger.log(ctx, `calling ProfileRepository save`);
    const res = await this.profileRepository.save(updatedProfile);
    return this.output(ProfileOutputDto, res);
  }
}

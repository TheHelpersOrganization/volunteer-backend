import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context/request-context.dto';
import { AbstractService } from 'src/common/services';

import { Prisma } from '@prisma/client';
import { ShiftSkillService } from 'src/shift/services';
import { LocationOutputDto } from '../../location/dtos';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma';
import {
  GetProfileInclude,
  GetProfileQueryDto,
  GetProfilesQueryDto,
  ProfileOutputDto,
  UpdateProfileInputDto,
} from '../dtos';

@Injectable()
export class ProfileService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly shiftSkillService: ShiftSkillService,
  ) {
    super(logger);
    this.logger.setContext(ProfileService.name);
  }

  async getProfiles(
    ctx: RequestContext,
    query: GetProfilesQueryDto,
  ): Promise<ProfileOutputDto[]> {
    this.logCaller(ctx, this.getProfiles);
    let where: Prisma.ProfileWhereInput | undefined;
    if (query.ids != null) {
      where = {
        accountId: {
          in: query.ids,
        },
      };
    }
    const profiles = await this.prisma.profile.findMany({
      where: where,
      include: {
        location: true,
        profileInterestedSkills: query.includes?.includes(
          GetProfileInclude.InterestedSkills,
        ),
      },
    });
    const res = profiles.map((profile) => ({
      ...profile,
      id: profile.accountId,
      interestedSkills: profile.profileInterestedSkills?.map((s) => s.skillId),
    }));
    return this.outputArray(ProfileOutputDto, res);
  }

  async getProfile(
    ctx: RequestContext,
    accountId: number,
    query?: GetProfileQueryDto,
  ): Promise<ProfileOutputDto> {
    this.logger.log(ctx, `${this.getProfile.name} was called`);
    this.logger.log(ctx, `calling prisma.profile findOneBy`);
    const profile = await this.prisma.profile.findUnique({
      where: { accountId: accountId },
      include: {
        location: true,
        profileInterestedSkills: query?.includes?.includes(
          GetProfileInclude.InterestedSkills,
        ),
      },
    });

    if (!profile) {
      this.logger.log(ctx, `account profile does not exist, create one`);
      this.logger.log(ctx, `calling prisma.profile create`);
      const profile = await this.prisma.profile.create({
        data: {
          accountId: accountId,
        },
      });
      return this.output(ProfileOutputDto, {
        ...profile,
        id: profile.accountId,
      });
    }
    const res = {
      ...profile,
      id: profile.accountId,
      interestedSkills: profile.profileInterestedSkills?.map((s) => s.skillId),
      skills: await this.shiftSkillService.getVolunteerSkillHours(accountId),
    };
    return this.output(ProfileOutputDto, res);
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

    let location: LocationOutputDto | undefined = undefined;
    if (input.location != null) {
      if (profile == null || profile.locationId == null) {
        location = await this.locationService.create(ctx, input.location);
      } else {
        location = await this.locationService.update(
          ctx,
          profile.locationId,
          input.location,
        );
      }
    }

    const updatedProfile: any = {
      ...input,
      location: undefined,
    };

    this.logger.log(ctx, `calling prisma.profile save`);
    const res = await this.prisma.profile.upsert({
      where: { accountId: accountId },
      create: {
        ...updatedProfile,
        accountId: accountId,
        locationId: location?.id,
      },
      update: {
        ...updatedProfile,
        accountId: accountId,
        locationId: location?.id,
      },
      include: {
        location: true,
      },
    });

    return this.output(ProfileOutputDto, res);
  }
}

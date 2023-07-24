import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context/request-context.dto';
import { AbstractService } from 'src/common/services';

import { Prisma } from '@prisma/client';
import { AccountNotFoundException } from 'src/auth/exceptions/account-not-found.exception';
import { ShiftSkillService } from 'src/shift-skill/services';
import { LocationOutputDto } from '../../location/dtos';
import { LocationService } from '../../location/services';
import { PrismaService } from '../../prisma';
import {
  GetProfileInclude,
  GetProfileQueryDto,
  GetProfileSelect,
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
    ctx: RequestContext | null | undefined,
    query: GetProfilesQueryDto,
  ): Promise<ProfileOutputDto[]> {
    this.logCaller(ctx, this.getProfiles);
    let where: Prisma.ProfileWhereInput | undefined;
    if (query.ids) {
      where = {
        accountId: {
          in: query.ids,
        },
      };
    }
    const profiles: any[] = await this.prisma.profile.findMany({
      where: where,
      select: this.parseProfileSelect(query),
      take: query.limit,
      skip: query.offset,
    });
    const res: any[] = [];

    for (const profile of profiles) {
      const skillHours = query?.includes?.includes(GetProfileInclude.SKILLS)
        ? await this.prisma.profileSkill.findMany({
            where: {
              profileId: profile.accountId,
            },
            include: {
              skill: true,
            },
          })
        : undefined;

      res.push({
        ...profile,
        id: profile.accountId,
        email: profile.account?.email,
        interestedSkills: profile.profileInterestedSkills?.map((s) => s.skill),
        skills: skillHours?.map((s) => ({ ...s.skill, hours: s.hours })),
      });
    }
    return this.outputArray(ProfileOutputDto, res);
  }

  async getProfile(
    ctx: RequestContext | null | undefined,
    accountId: number,
    query?: GetProfileQueryDto,
  ): Promise<ProfileOutputDto | null> {
    this.logger.log(ctx, `${this.getProfile.name} was called`);
    this.logger.log(ctx, `calling prisma.profile findOneBy`);

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return null;
    }

    const profile: any | null = await this.prisma.profile.findUnique({
      where: { accountId: accountId },
      select: this.parseProfileSelect(query),
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
        email: account.email,
      });
    }
    const skillHours = query?.includes?.includes(GetProfileInclude.SKILLS)
      ? await this.prisma.profileSkill.findMany({
          where: {
            profileId: profile.accountId,
          },
          include: {
            skill: true,
          },
        })
      : undefined;
    console.log(this.parseProfileSelect(query));
    const res = {
      ...profile,
      id: profile.accountId,
      email: account.email,
      interestedSkills: profile.profileInterestedSkills?.map((s) => s.skill),
      skills: skillHours?.map((s) => ({ ...s.skill, hours: s.hours })),
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

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AccountNotFoundException();
    }

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

  parseProfileSelect(query?: GetProfileQueryDto) {
    const select = query?.select;
    const defaultSelect = select == null || select?.length === 0;

    const res: Prisma.ProfileSelect = {
      username: select?.includes(GetProfileSelect.Username) || defaultSelect,
      firstName: select?.includes(GetProfileSelect.FullName) || defaultSelect,
      lastName: select?.includes(GetProfileSelect.FullName) || defaultSelect,
      phoneNumber:
        select?.includes(GetProfileSelect.PhoneNumber) || defaultSelect,
      dateOfBirth:
        select?.includes(GetProfileSelect.DateOfBirth) || defaultSelect,
      gender: select?.includes(GetProfileSelect.Gender) || defaultSelect,
      bio: select?.includes(GetProfileSelect.Bio) || defaultSelect,
      avatarId: select?.includes(GetProfileSelect.Avatar) || defaultSelect,
      location: select?.includes(GetProfileSelect.Location) || defaultSelect,
      account:
        select?.includes(GetProfileSelect.Email) ||
        (defaultSelect && {
          select: {
            email: true,
          },
        }),
      accountId: true,
      profileInterestedSkills: query?.includes?.includes(
        GetProfileInclude.INTERESTED_SKILLS,
      )
        ? { include: { skill: true } }
        : false,
    };
    return res;
  }
}

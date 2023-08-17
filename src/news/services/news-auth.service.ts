import { ActivityService } from '@app/activity/services';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { OrganizationMemberStatus } from '@app/organization/constants';
import {
  OrganizationMemberService,
  OrganizationService,
} from '@app/organization/services';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NewsNotFoundException } from '../exceptions';
import { CreateAuthorizedNewsWhereQuery } from '../types';
import { NewsService } from './news.service';

@Injectable()
export class NewsAuthorizationService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly organizationService: OrganizationService,
    private readonly memberService: OrganizationMemberService,
    private readonly activityService: ActivityService,
    private readonly newsService: NewsService,
  ) {
    super(logger);
  }

  getAuthorizeWhereQuery(
    context: RequestContext,
  ): CreateAuthorizedNewsWhereQuery {
    // Everyone can see published news and news from organizations they are members of
    return (where: Prisma.NewsWhereInput) => {
      if (where.OR == null) {
        where.OR = [];
      }
      where.OR.push(
        {
          isPublished: true,
        },
        {
          organization: {
            members: {
              some: {
                accountId: context.account.id,
                status: OrganizationMemberStatus.Approved,
              },
            },
          },
        },
      );
      return where;
    };
  }

  async validateCanCreateNews(
    context: RequestContext,
    organizationId: number,
    extra?: { activityId?: number },
  ) {
    const organization =
      await this.organizationService.validateApprovedOrganization(
        organizationId,
      );

    const res = await this.memberService.checkApproveMemberAccount(
      organizationId,
      context.account.id,
      {
        useOrganization: organization,
      },
    );
    if (extra?.activityId) {
      await this.activityService.validateOrganizationActivity(
        organizationId,
        extra.activityId,
      );
    }
    if (!res) {
      throw new ForbiddenException();
    }
  }

  async validateCanUpdateNews(context: RequestContext, newsId: number) {
    const news = await this.newsService.getNewsById(context, newsId);
    if (news == null) {
      throw new NewsNotFoundException();
    }
    const organizationId = news.organizationId;
    const organization =
      await this.organizationService.validateApprovedOrganization(
        organizationId,
      );
    const res = await this.memberService.checkApproveMemberAccount(
      organizationId,
      context.account.id,
      {
        useOrganization: organization,
      },
    );
    if (!res) {
      throw new ForbiddenException();
    }
  }

  async validateCanDeleteNews(context: RequestContext, newsId: number) {
    await this.validateCanUpdateNews(context, newsId);
  }
}

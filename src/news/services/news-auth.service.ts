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
import { CreateAuthorizedNewsWhereQuery } from '../types';

@Injectable()
export class NewsAuthorizationService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly organizationService: OrganizationService,
    private readonly memberService: OrganizationMemberService,
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

  async validateCanCreateNews(context: RequestContext, organizationId: number) {
    await this.validateCanCrudNews(context, organizationId);
  }

  async validateCanUpdateNews(context: RequestContext, organizationId: number) {
    await this.validateCanCrudNews(context, organizationId);
  }

  async validateCanDeleteNews(context: RequestContext, organizationId: number) {
    await this.validateCanCrudNews(context, organizationId);
  }

  private async validateCanCrudNews(
    context: RequestContext,
    organizationId: number,
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
    if (!res) {
      throw new ForbiddenException();
    }
  }
}

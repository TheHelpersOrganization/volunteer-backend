import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { OrganizationMemberRole } from 'src/organization/constants';
import { OrganizationRoleService } from 'src/organization/services';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ActivityRoleService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly organizationRoleService: OrganizationRoleService,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async validateAccountMemberCanManageActivity(data: {
    organizationId: number;
    accountId: number;
    activityId: number;
  }) {
    const hasRole =
      await this.organizationRoleService.checkAccountMemberHasRole(
        data.organizationId,
        data.accountId,
        OrganizationMemberRole.ActivityManager,
      );
    const isActivityManager =
      (await this.prisma.activity.count({
        where: {
          id: data.activityId,
          activityManagers: {
            some: {
              accountId: data.accountId,
            },
          },
        },
      })) > 0;
    if (!hasRole && !isActivityManager) {
      throw new UnauthorizedException('Forbidden');
    }
  }
}

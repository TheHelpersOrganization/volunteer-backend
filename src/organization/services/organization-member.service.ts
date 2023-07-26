import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { requireNonNullish } from 'prisma/seed/utils';
import { AuthService } from 'src/auth/services';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import { RoleService } from 'src/role/services';
import {
  OrganizationMemberRole,
  OrganizationMemberRoleWeight,
  OrganizationMemberStatus,
  OrganizationStatus,
  nonOwnerOrganizationMemberRoles,
} from '../constants';
import {
  GetMemberByIdQueryDto,
  GetMemberInclude,
  GetMemberQueryDto,
  GrantRoleInputDto,
  MemberOutputDto,
  MemberRolesOutputDto,
  OrganizationOutputDto,
  RevokeRoleInputDto,
  TransferOwnershipInputDto,
} from '../dtos';
import {
  CannotTransferOwnershipToSelfException,
  OrganizationNotFoundException,
  UserHaveAlreadyJoinedOrganizationException,
  UserHaveNotJoinedOrganizationException,
  UserRegistrationStatusNotPendingException,
  UserStatusNotApprovedException,
} from '../exceptions';
import { OrganizationRoleService } from './organization-role.service';

@Injectable()
export class OrganizationMemberService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly profileService: ProfileService,
    private readonly organizationRoleService: OrganizationRoleService,
    private readonly authService: AuthService,
  ) {
    super(logger);
  }

  async getMe(
    context: RequestContext,
    organizationId: number,
    query?: GetMemberQueryDto,
  ): Promise<MemberOutputDto | null> {
    this.logCaller(context, this.getMe);
    const accountId = context.account.id;

    const member = await this.prisma.member.findFirst({
      where: {
        accountId: accountId,
        organizationId: organizationId,
      },
      include: this.getMemberInclude(query?.include),
    });

    if (member == null) {
      return null;
    }

    return this.mapToDto(member, query?.include);
  }

  async getMembers(
    context: RequestContext,
    organizationId: number,
    query?: GetMemberQueryDto,
  ): Promise<MemberOutputDto[]> {
    this.logCaller(context, this.getMembers);

    const members = await this.prisma.member.findMany({
      where: this.getMemberWhere(organizationId, query),
      include: this.getMemberInclude(query?.include),
      take: query?.limit,
      skip: query?.offset,
    });

    return this.mapManyToDto(members, query?.include);
  }

  getMemberWhere(organizationId: number, query?: GetMemberQueryDto) {
    const where: Prisma.MemberWhereInput = {
      organizationId: organizationId,
    };
    if (!query) {
      return where;
    }
    if (query.name) {
      where.account = {
        profile: {
          OR: [
            {
              username: {
                contains: query.name,
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: query.name,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: query.name,
                mode: 'insensitive',
              },
            },
          ],
        },
      };
    }
    if (query.role) {
      where.MemberRole = {
        some: {
          role: {
            name: {
              in: query.role,
            },
          },
        },
      };
    }
    if (query.statuses) {
      where.status = {
        in: query.statuses,
      };
    }
    return where;
  }

  async getMemberById(
    context: RequestContext,
    organizationId: number,
    memberId: number,
    query?: GetMemberByIdQueryDto,
  ) {
    this.logCaller(context, this.getMemberById);

    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
        organization: {
          id: organizationId,
        },
      },
      include: this.getMemberInclude(query?.include),
    });

    if (member == null) {
      return null;
    }

    const output = this.mapToDto(member, query?.include);

    return output;
  }

  async getMemberByIdOrThrow(
    context: RequestContext,
    organizationId: number,
    memberId?: number,
    query?: GetMemberByIdQueryDto,
  ) {
    this.logCaller(context, this.getMemberById);

    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
        organization: {
          id: organizationId,
        },
      },
      include: this.getMemberInclude(query?.include),
    });

    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    const output = this.mapToDto(member, query?.include);

    return output;
  }

  // status: pending
  async join(
    context: RequestContext,
    organizationId: number,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.join);
    const accountId = context.account.id;

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        status: OrganizationStatus.Verified,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        accountId: accountId,
        organizationId: organizationId,
      },
    });
    if (
      member != null &&
      (member.status == OrganizationMemberStatus.Pending ||
        member.status == OrganizationMemberStatus.Approved)
    ) {
      throw new UserHaveAlreadyJoinedOrganizationException();
    }

    const organizationMember = member?.id
      ? await this.prisma.member.update({
          where: {
            id: member.id,
          },
          data: {
            status: OrganizationMemberStatus.Pending,
          },
        })
      : await this.prisma.member.create({
          data: {
            organizationId: organizationId,
            accountId: accountId,
            status: OrganizationMemberStatus.Pending,
          },
        });

    return this.output(MemberOutputDto, organizationMember);
  }

  // pending -> cancelled
  async cancel(
    context: RequestContext,
    organizationId: number,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.cancel);
    const accountId = context.account.id;

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        status: OrganizationStatus.Verified,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        accountId: accountId,
        organizationId: organizationId,
        status: OrganizationMemberStatus.Pending,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    const updated = await this.prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        status: OrganizationMemberStatus.Cancelled,
      },
    });

    return this.output(MemberOutputDto, updated);
  }

  // approved -> left
  async leave(
    context: RequestContext,
    organizationId: number,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.leave);
    const accountId = context.account.id;

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        status: OrganizationStatus.Verified,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        accountId: accountId,
        organizationId: organizationId,
        status: OrganizationMemberStatus.Approved,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    const updated = await this.prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        status: OrganizationMemberStatus.Left,
      },
    });

    return this.output(MemberOutputDto, updated);
  }

  // pending -> approved
  // pending -> rejected
  async approveOrRejectMember(
    context: RequestContext,
    organizationId: number,
    memberId: number,
    status: OrganizationMemberStatus,
    rejectionReason?: string,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.approveOrRejectMember);

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        status: OrganizationStatus.Verified,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }
    if (member.status != OrganizationMemberStatus.Pending) {
      throw new UserRegistrationStatusNotPendingException();
    }

    const updated = await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        status: status,
        rejectionReason:
          status == OrganizationMemberStatus.Rejected
            ? rejectionReason
            : undefined,
        censorId: context.account.id,
      },
    });

    return this.output(MemberOutputDto, updated);
  }

  // approved -> removed
  async removeMember(
    context: RequestContext,
    organizationId: number,
    memberId: number,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.removeMember);

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }
    if (member.status !== OrganizationMemberStatus.Approved) {
      throw new UserStatusNotApprovedException();
    }

    const updated = await this.prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        status: OrganizationMemberStatus.Removed,
        censorId: context.account.id,
      },
    });

    return this.output(MemberOutputDto, updated);
  }

  async getMemberRoles(
    context: RequestContext,
    organizationId: number,
    memberId: number,
  ) {
    this.logCaller(context, this.getMemberRoles);

    const { member } = await this.validateApprovedMember(
      organizationId,
      memberId,
    );
    const grantableRoles =
      await this.organizationRoleService.getAccountMemberCanGrantRoles(
        organizationId,
        context.account.id,
        memberId,
      );

    const assignedRoles = await this.prisma.memberRole.findMany({
      where: {
        memberId: member.id,
      },
      include: {
        role: true,
      },
    });
    const maxAssignRoleWeight = Math.max(
      ...assignedRoles.map((v) => OrganizationMemberRoleWeight[v.role.name]),
    );

    const roles = await this.prisma.role.findMany({
      where: {
        name: {
          in: nonOwnerOrganizationMemberRoles,
        },
      },
    });

    const availableRoles = roles.filter(
      (role) =>
        !assignedRoles.find((assignedRole) => assignedRole.roleId == role.id) &&
        OrganizationMemberRoleWeight[role.name] > maxAssignRoleWeight,
    );
    const canGrantRoles = roles.filter((role) =>
      grantableRoles.find((grantableRole) => grantableRole == role.name),
    );

    return this.output(MemberRolesOutputDto, {
      assignedRoles: assignedRoles.map((v) => v.role),
      availableRoles: availableRoles.map((v) => ({
        ...v,
        createdAt: undefined,
      })),
      canGrantRoles: canGrantRoles.map((v) => ({ ...v, createdAt: undefined })),
      canRevokeRoles: canGrantRoles.map((v) => ({
        ...v,
        createdAt: undefined,
      })),
    });
  }

  async grantMemberRole(
    context: RequestContext,
    organizationId: number,
    memberId: number,
    dto: GrantRoleInputDto,
  ) {
    this.logCaller(context, this.grantMemberRole);

    const oldMember = (
      await this.validateApprovedMember(organizationId, memberId)
    ).member;

    const role = await this.roleService.getRoleByNameOrThrow(dto.role);

    await this.prisma.$transaction(async (tx) => {
      await tx.memberRole.deleteMany({
        where: {
          memberId: oldMember.id,
        },
      });
      await tx.memberRole.create({
        data: {
          memberId: oldMember.id,
          roleId: role.id,
          grantedBy: context.account.id,
        },
      });
    });

    return this.getMemberByIdOrThrow(context, organizationId, memberId);
  }

  async transferOwnership(
    context: RequestContext,
    organizationId: number,
    dto: TransferOwnershipInputDto,
  ) {
    this.logCaller(context, this.transferOwnership);
    await this.authService.validateAccountPassword(
      context.account.id,
      dto.password,
    );
    const { organization, member: targetMember } =
      await this.validateApprovedMember(organizationId, dto.memberId);
    const ownerMember = await this.prisma.member.findFirst({
      where: {
        accountId: context.account.id,
        organizationId: organization.id,
        status: OrganizationMemberStatus.Approved,
      },
    });
    if (ownerMember == null) {
      throw new UserStatusNotApprovedException();
    }

    if (ownerMember.id == targetMember.id) {
      throw new CannotTransferOwnershipToSelfException();
    }

    const roles = await this.roleService.getRoleByNamesOrThrow([
      OrganizationMemberRole.Owner,
      OrganizationMemberRole.Manager,
    ]);
    const ownerRole = requireNonNullish(
      roles.find((role) => role.name == OrganizationMemberRole.Owner),
    );
    const managerRole = requireNonNullish(
      roles.find((role) => role.name == OrganizationMemberRole.Manager),
    );

    const newOrganization = await this.prisma.$transaction(async (tx) => {
      await tx.memberRole.deleteMany({
        where: {
          memberId: ownerMember.id,
        },
      });
      await tx.memberRole.create({
        data: {
          memberId: ownerMember.id,
          roleId: managerRole.id,
          grantedBy: context.account.id,
        },
      });
      await tx.memberRole.deleteMany({
        where: {
          memberId: targetMember.id,
        },
      });
      await tx.memberRole.create({
        data: {
          memberId: targetMember.id,
          roleId: ownerRole.id,
          grantedBy: context.account.id,
        },
      });
      return tx.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          ownerId: targetMember.accountId,
        },
      });
    });

    return this.output(OrganizationOutputDto, newOrganization);
  }

  async revokeMemberRole(
    context: RequestContext,
    organizationId: number,
    memberId: number,
    dto: RevokeRoleInputDto,
  ) {
    this.logCaller(context, this.revokeMemberRole);

    const member = (await this.validateApprovedMember(organizationId, memberId))
      .member;

    const role = await this.roleService.getRoleByNameOrThrow(dto.role);

    await this.prisma.memberRole.delete({
      where: {
        memberId_roleId: {
          memberId: member.id,
          roleId: role.id,
        },
      },
    });

    return this.getMemberByIdOrThrow(context, organizationId, memberId);
  }

  async validateApprovedMember(organizationId: number, memberId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    if (organization == null) {
      throw new OrganizationNotFoundException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: organizationId,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }
    if (member.status !== OrganizationMemberStatus.Approved) {
      throw new UserStatusNotApprovedException();
    }

    return {
      organization,
      member,
    };
  }

  private getMemberInclude(include?: GetMemberInclude[]) {
    if (include == null || include.length == 0) {
      return undefined;
    }

    const res: Prisma.MemberInclude = {};

    if (include?.includes(GetMemberInclude.Role)) {
      res.MemberRole = {
        include: {
          role: true,
        },
      };
    }

    return res;
  }

  private async mapManyToDto(
    raws: any[],
    includes?: GetMemberInclude[],
  ): Promise<MemberOutputDto[]> {
    const memberProfileIds = includes?.includes(GetMemberInclude.Profile)
      ? raws.map((raw) => raw.accountId)
      : [];
    const granterProfileIds = raws
      .map((raw) => raw.MemberRole?.map((role) => role.grantedBy))
      .flat()
      .filter((p) => p != null);
    const profileIds = [...memberProfileIds, ...granterProfileIds];
    const profiles =
      profileIds.length > 0
        ? await this.profileService.getProfiles(undefined, {
            ids: profileIds,
            select: getProfileBasicSelect,
          })
        : undefined;

    const outputs = raws.map((raw) => ({
      ...raw,
      profile: profiles?.find((p) => p.id == raw.accountId),
      roles: raw.MemberRole?.map((memberRole) => ({
        name: memberRole.role.name,
        displayName: memberRole.role.displayName,
        createdAt: memberRole.createdAt ?? undefined,
        grantedBy: includes?.includes(GetMemberInclude.RoleGranter)
          ? profiles?.find((p) => p.id == memberRole.grantedBy)
          : undefined,
      })),
    }));

    return this.outputArray(MemberOutputDto, outputs);
  }

  private async mapToDto(
    raw: any,
    includes?: GetMemberInclude[],
  ): Promise<MemberOutputDto> {
    const memberProfileIds =
      raw.MemberRole?.map((role) => role.grantedBy).filter((p) => p != null) ??
      [];
    const accountMemberId = includes?.includes(GetMemberInclude.Profile)
      ? [raw.accountId]
      : [];
    const profileIds = [...memberProfileIds, ...accountMemberId];
    const profiles =
      profileIds.length == 0
        ? undefined
        : await this.profileService.getProfiles(undefined, {
            ids: profileIds,
            select: getProfileBasicSelect,
          });
    const output = {
      ...raw,
      profile: profiles?.find((p) => p.id == raw.accountId),
      roles: raw.MemberRole?.map((memberRole) => ({
        name: memberRole.role.name,
        displayName: memberRole.role.displayName,
        createdAt: memberRole.createdAt ?? undefined,
        grantedBy: includes?.includes(GetMemberInclude.RoleGranter)
          ? profiles?.find((p) => p.id == memberRole.grantedBy)
          : undefined,
      })),
    };
    return this.output(MemberOutputDto, output);
  }
}

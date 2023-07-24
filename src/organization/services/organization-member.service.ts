import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import { RoleService } from 'src/role/services';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';
import {
  GetMemberQueryDto,
  GrantRoleInputDto,
  MemberOutputDto,
  RevokeRoleInputDto,
} from '../dtos';
import {
  OrganizationNotFoundException,
  UserHaveAlreadyJoinedOrganizationException,
  UserHaveNotJoinedOrganizationException,
  UserRegistrationStatusNotPendingException,
  UserStatusNotApprovedException,
} from '../exceptions';

@Injectable()
export class OrganizationMemberService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getMe(
    context: RequestContext,
    organizationId: number,
  ): Promise<MemberOutputDto[]> {
    this.logCaller(context, this.getMe);
    const accountId = context.account.id;

    const members = await this.prisma.member.findMany({
      where: {
        accountId: accountId,
        organizationId: organizationId,
      },
      include: {
        MemberRole: {
          include: {
            role: true,
          },
        },
      },
    });
    if (members.length == 0) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    const outputs = Promise.all(members.map((m) => this.mapToDto(m)));
    return outputs;
  }

  async getMembers(
    context: RequestContext,
    organizationId: number,
    dto?: GetMemberQueryDto,
  ): Promise<MemberOutputDto[]> {
    this.logCaller(context, this.getMembers);

    const members = await this.prisma.member.findMany({
      where: {
        organization: {
          id: organizationId,
        },
        status: {
          in: dto?.statuses,
        },
      },
      include: {
        MemberRole: {
          include: {
            role: true,
          },
        },
      },
    });

    const outputs = Promise.all(members.map((m) => this.mapToDto(m)));

    return outputs;
  }

  async getMemberById(
    context: RequestContext,
    organizationId: number,
    memberId?: number,
  ): Promise<MemberOutputDto> {
    this.logCaller(context, this.getMemberById);

    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
        organization: {
          id: organizationId,
        },
      },
      include: {
        MemberRole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    const output = this.mapToDto(member);

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
        status: {
          in: [
            OrganizationMemberStatus.Pending,
            OrganizationMemberStatus.Approved,
          ],
        },
      },
    });
    if (member != null) {
      throw new UserHaveAlreadyJoinedOrganizationException();
    }

    const organizationMember = await this.prisma.member.create({
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

    await this.prisma.memberRole.upsert({
      where: {
        memberId_roleId: {
          memberId: oldMember.id,
          roleId: role.id,
        },
      },
      create: {
        memberId: oldMember.id,
        roleId: role.id,
        grantedBy: context.account.id,
      },
      update: {},
    });

    return this.getMemberById(context, organizationId, memberId);
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

    return this.getMemberById(context, organizationId, memberId);
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

  private async mapToDto(raw: any): Promise<MemberOutputDto> {
    const profileIds = raw.MemberRole.map((role) => role.grantedBy).filter(
      (p) => p != null,
    );
    const profiles = await this.profileService.getProfiles(undefined, {
      ids: profileIds,
      select: getProfileBasicSelect,
    });

    const output = {
      ...raw,
      roles: raw.MemberRole.map((memberRole) => ({
        name: memberRole.role.name,
        createdAt: memberRole.createdAt ?? undefined,
        grantedBy: profiles.find((p) => p.id == memberRole.grantedBy),
      })),
    };
    return this.output(MemberOutputDto, output);
  }
}

import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { OrganizationMemberStatus, OrganizationStatus } from '../constants';
import { GetMemberQueryDto, MemberOutputDto } from '../dtos';
import {
  OrganizationNotFoundException,
  UserHaveAlreadyJoinedOrganizationException,
  UserHaveNotJoinedOrganizationException,
  UserRegistrationStatusNotPendingException,
  UserStatusNotApprovedException,
} from '../exceptions';

@Injectable()
export class OrganizationMemberService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getMe(
    context: RequestContext,
    organizationId: number,
  ): Promise<MemberOutputDto[]> {
    this.logCaller(context, this.getMe);
    const accountId = context.account.id;

    const member = await this.prisma.member.findMany({
      where: {
        accountId: accountId,
        organizationId: organizationId,
      },
    });
    if (member == null) {
      throw new UserHaveNotJoinedOrganizationException();
    }

    return this.outputArray(MemberOutputDto, member);
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
    });

    return this.outputArray(MemberOutputDto, members);
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

  // approved -> leaved
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
}

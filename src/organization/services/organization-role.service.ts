import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { RoleOutputDto } from 'src/role/dto';
import { RoleNotFountException } from 'src/role/exceptions';
import { RoleService } from 'src/role/services';
import {
  OrganizationMemberRole,
  OrganizationMemberRoleWeight,
  OrganizationMemberStatus,
  organizationMemberRoles,
} from '../constants';

@Injectable()
export class OrganizationRoleService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
  ) {
    super(logger);
  }

  async getMemberRoles(memberId: number) {
    const res = await this.prisma.memberRole.findMany({
      where: {
        memberId: memberId,
      },
      include: {
        role: true,
      },
    });

    return this.outputArray(
      RoleOutputDto,
      res.map((v) => v.role),
    );
  }

  async getAccountMemberRoles(organizationId: number, accountId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        organizationId: organizationId,
        accountId: accountId,
        status: OrganizationMemberStatus.Approved,
      },
    });
    if (!member) {
      return [];
    }
    return this.getMemberRoles(member.id);
  }

  async validateMemberHasRole(
    memberId: number,
    roleName: OrganizationMemberRole,
  ) {
    const role = await this.roleService.getRoleByNameOrThrow(roleName);
    const res = await this.prisma.memberRole.findUnique({
      where: {
        memberId_roleId: {
          memberId: memberId,
          roleId: role.id,
        },
      },
    });
    if (!res) {
      throw new UnauthorizedException(`Forbidden`);
    }
    return res;
  }

  async validateAccountMemberHasRole(
    organizationId: number,
    accountId: number,
    roleName: OrganizationMemberRole,
  ) {
    const member = await this.getMemberOrThrow(organizationId, accountId);
    return this.validateMemberHasRole(member.id, roleName);
  }

  async validateMemberHasRoles(
    memberId: number,
    roleNames: OrganizationMemberRole[],
  ) {
    const roles = await this.roleService.getRoleByNamesOrThrow(roleNames);
    const res = await this.prisma.memberRole.findMany({
      where: {
        memberId: memberId,
        roleId: {
          in: roles.map((role) => role.id),
        },
      },
    });
    if (res.length !== roles.length) {
      throw new UnauthorizedException(`Forbidden`);
    }
    return res;
  }

  async validateMemberHasAnyRole(
    memberId: number,
    roleNames: OrganizationMemberRole[],
  ) {
    const roles = await this.roleService.getRoleByNamesOrThrow(roleNames);
    const res = await this.prisma.memberRole.findMany({
      where: {
        memberId: memberId,
        roleId: {
          in: roles.map((role) => role.id),
        },
      },
    });
    if (res.length < 1) {
      throw new UnauthorizedException(`Forbidden`);
    }
    return res;
  }

  async getAccountMemberCanGrantRoles(
    organizationId: number,
    granterAccountId: number,
    targetMemberId: number,
  ) {
    if (granterAccountId === targetMemberId) {
      return [];
    }
    const memberRoles = (
      await this.getAccountMemberRoles(organizationId, granterAccountId)
    ).map((v) => {
      const r = organizationMemberRoles.find((role) => role === v.name);
      if (!r) {
        throw new RoleNotFountException();
      }
      return r;
    });
    const maxRoleWeight = Math.max(
      ...memberRoles.map((v) => OrganizationMemberRoleWeight[v]),
    );
    const grantableRoles = organizationMemberRoles.filter((role) => {
      return OrganizationMemberRoleWeight[role] < maxRoleWeight;
    });
    return grantableRoles;
  }

  async validateAccountMemberGrantRole(
    organizationId: number,
    granterAccountId: number,
    targetMemberId: number,
    roleName: OrganizationMemberRole,
  ) {
    if (granterAccountId === targetMemberId) {
      throw new UnauthorizedException(`Cannot grant role to yourself`);
    }
    const memberRoles = (
      await this.getAccountMemberRoles(organizationId, granterAccountId)
    ).map((v) => {
      const r = organizationMemberRoles.find((role) => role === v.name);
      if (!r) {
        throw new RoleNotFountException();
      }
      return r;
    });
    if (memberRoles.length < 1) {
      throw new UnauthorizedException(`Forbidden`);
    }
    if (
      OrganizationMemberRoleWeight[roleName] >=
      Math.max(...memberRoles.map((v) => OrganizationMemberRoleWeight[v]))
    ) {
      throw new UnauthorizedException(`Forbidden`);
    }
  }

  async getMemberCanGrantRoles(granterMemberId: number) {
    const memberRoles = (await this.getMemberRoles(granterMemberId)).map(
      (v) => {
        const r = organizationMemberRoles.find((role) => role === v.name);
        if (!r) {
          throw new RoleNotFountException();
        }
        return r;
      },
    );
    const maxRoleWeight = Math.max(
      ...memberRoles.map((v) => OrganizationMemberRoleWeight[v]),
    );
    const grantableRoles = organizationMemberRoles.filter((role) => {
      return OrganizationMemberRoleWeight[role] < maxRoleWeight;
    });
    return grantableRoles;
  }

  async validateMemberCanGrantRole(
    granterMemberId: number,
    roleName: OrganizationMemberRole,
  ) {
    const memberRoles = (await this.getMemberRoles(granterMemberId)).map(
      (v) => {
        const r = organizationMemberRoles.find((role) => role === v.name);
        if (!r) {
          throw new RoleNotFountException();
        }
        return r;
      },
    );
    if (memberRoles.length < 1) {
      throw new UnauthorizedException(`Forbidden`);
    }
    if (
      OrganizationMemberRoleWeight[roleName] >=
      Math.max(...memberRoles.map((v) => OrganizationMemberRoleWeight[v]))
    ) {
      throw new UnauthorizedException(`Forbidden`);
    }
  }

  async getMemberOrThrow(organizationId: number, accountId: number) {
    const member = await this.prisma.member.findFirst({
      where: {
        organizationId: organizationId,
        accountId: accountId,
        status: OrganizationMemberStatus.Approved,
      },
    });
    if (!member) {
      throw new UnauthorizedException(`Forbidden`);
    }
    return member;
  }
}

import { Role } from '@app/auth/constants';
import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { OrganizationMemberRole } from '@app/organization/constants';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { CreateRoleInputDto, CreateRoleOutputDto, RoleOutputDto } from '../dto';
import { RoleNotFountException } from '../exceptions';

@Injectable()
export class RoleService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async createRole(
    context: RequestContext,
    dto: CreateRoleInputDto,
  ): Promise<CreateRoleOutputDto> {
    this.logCaller(context, this.createRole);

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return this.output(CreateRoleOutputDto, role);
  }

  async createDefaultRoles(
    context: RequestContext,
  ): Promise<CreateRoleOutputDto[]> {
    this.logCaller(context, this.createDefaultRoles);

    await this.prisma.role.createMany({
      data: [
        { name: Role.Volunteer, description: 'Volunteer' },
        { name: Role.Moderator, description: 'Moderator' },
        { name: Role.Admin, description: 'Admin' },
        { name: Role.Operator, description: 'Operator' },
        {
          name: OrganizationMemberRole.Owner,
          description:
            'Organization Manager can read, update and delete organization',
        },
        {
          name: OrganizationMemberRole.Manager,
          description: 'Organization Manager can read, update',
        },
        {
          name: OrganizationMemberRole.MemberManager,
          description:
            'Organization Member Manager can read, update and delete organization member',
        },
        {
          name: OrganizationMemberRole.ActivityManager,
          description:
            'Organization Activity Manager can read, update and delete organization activity',
        },
      ],
      skipDuplicates: true,
    });
    const roles = await this.prisma.role.findMany({
      where: { name: { in: Object.values(Role) } },
    });

    return this.outputArray(CreateRoleOutputDto, roles);
  }

  async getRoleByName(name: string) {
    const res = await this.prisma.role.findUnique({ where: { name } });
    if (res == null) {
      return null;
    }
    return this.output(RoleOutputDto, res);
  }

  async getRoleByNamesOrThrow(names: string[]) {
    const res = await this.prisma.role.findMany({
      where: { name: { in: names } },
    });
    if (res.length !== names.length) {
      throw new RoleNotFountException();
    }
    return this.outputArray(RoleOutputDto, res);
  }

  async getRoleByNameOrThrow(name: string) {
    const res = await this.prisma.role.findUnique({ where: { name } });
    if (res == null) {
      throw new RoleNotFountException();
    }
    return this.output(RoleOutputDto, res);
  }
}

import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/constants';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { CreateRoleInputDto, CreateRoleOutputDto } from '../dto';

@Injectable()
export class RoleService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
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
      ],
      skipDuplicates: true,
    });
    const roles = await this.prisma.role.findMany({
      where: { name: { in: Object.values(Role) } },
    });

    return this.outputArray(CreateRoleOutputDto, roles);
  }
}

import { Injectable } from '@nestjs/common';
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
}

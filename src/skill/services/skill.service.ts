import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import {
  CreateSkillInputDto,
  SkillOutputDto,
  SkillQueryDto,
  UpdateSkillInputDto,
} from '../dtos';

@Injectable()
export class SkillService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super(logger);
  }

  async create(
    context: RequestContext,
    dto: CreateSkillInputDto,
  ): Promise<SkillOutputDto> {
    this.logCaller(context, this.create);
    const res = await this.prisma.skill.create({
      data: dto,
    });
    return this.output(SkillOutputDto, res);
  }

  async getAll(
    context: RequestContext,
    query: SkillQueryDto,
  ): Promise<SkillOutputDto> {
    this.logCaller(context, this.getAll);
    const where = this.getSkillWhere(query);
    const res = await this.prisma.skill.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
    });
    return this.output(SkillOutputDto, res);
  }

  getSkillWhere(query: SkillQueryDto) {
    const where: Prisma.SkillWhereInput = {};
    if (query.ids || query.excludeId) {
      where.id = {
        in: query.ids,
        notIn: query.excludeId,
      };
    }
    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }
    if (Object.keys(where).length === 0) {
      return undefined;
    }
    return where;
  }

  async getById(context: RequestContext, id: number): Promise<SkillOutputDto> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.skill.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(SkillOutputDto, res);
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateSkillInputDto,
  ): Promise<SkillOutputDto> {
    this.logCaller(context, this.update);
    const res = await this.prisma.skill.update({
      where: {
        id: id,
      },
      data: dto,
    });
    return this.output(SkillOutputDto, res);
  }

  async delete(context: RequestContext, id: number): Promise<SkillOutputDto> {
    this.logCaller(context, this.delete);
    const res = await this.prisma.skill.delete({
      where: {
        id: id,
      },
    });
    return this.output(SkillOutputDto, res);
  }
}

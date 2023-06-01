import { Injectable } from '@nestjs/common';
import { PaginationParamsDto } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import {
  CreateSkillInputDto,
  SkillOutputDto,
  SkillQueryDto,
  UpdateSkillInputDto,
} from '../dtos';

@Injectable()
export class SkillService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
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
    const res = await this.prisma.skill.findMany({
      where: {
        id: {
          in: query.ids,
        },
      },
      take: query.limit,
      skip: query.offset,
    });
    return this.output(SkillOutputDto, res);
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

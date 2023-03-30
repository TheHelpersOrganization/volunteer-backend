import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import {
  ActivityTypeOutputDto,
  CreateOrUpdateActivityTypeInputDto,
} from '../dtos';
import { CreateOrUpdateActivityTypeOutputDto } from '../dtos/create-or-update-activity-type.output.dto';

@Injectable()
export class ActivityTypeService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getAll(context: RequestContext): Promise<ActivityTypeOutputDto[]> {
    this.logCaller(context, this.getAll);
    return this.outputArray(
      ActivityTypeOutputDto,
      await this.prisma.activityType.findMany(),
    );
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<ActivityTypeOutputDto> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.activityType.findUnique({
      where: {
        id: id,
      },
    });
    return this.output(ActivityTypeOutputDto, res);
  }

  async createOrUpdate(
    context: RequestContext,
    dto: CreateOrUpdateActivityTypeInputDto,
  ): Promise<CreateOrUpdateActivityTypeOutputDto> {
    this.logCaller(context, this.createOrUpdate);
    const res = await this.prisma.activityType.upsert({
      where: {
        id: dto.id ?? 0,
      },
      create: dto,
      update: dto,
    });
    return this.output(CreateOrUpdateActivityTypeOutputDto, res);
  }

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<ActivityTypeOutputDto> {
    this.logCaller(context, this.delete);
    const res = await this.prisma.activityType.delete({
      where: {
        id: id,
      },
    });
    return this.output(ActivityTypeOutputDto, res);
  }
}

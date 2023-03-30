import { Injectable } from '@nestjs/common';
import {
  Activity,
  ActivityActivityType,
  ActivityManager,
} from '@prisma/client';
import { PaginationParamsDto } from 'src/common/dtos';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

import {
  ActivityOutputDto,
  CreateActivityInputDto,
  UpdateActivityInputDto,
} from '../dtos';

@Injectable()
export class ActivityService extends AbstractService {
  constructor(logger: AppLogger, private readonly prisma: PrismaService) {
    super(logger);
  }

  async getAll(
    context: RequestContext,
    query: PaginationParamsDto,
  ): Promise<ActivityOutputDto[]> {
    this.logCaller(context, this.getAll);
    const res = await this.prisma.activity.findMany({
      take: query.limit,
      skip: query.offset,
      include: {
        activityActivityTypes: true,
        activityManagers: true,
      },
    });
    const updated = res.map((activity) => this.mapToDto(activity));

    return this.outputArray(ActivityOutputDto, updated);
  }

  async getById(
    context: RequestContext,
    id: number,
  ): Promise<ActivityOutputDto | null> {
    this.logCaller(context, this.getById);
    const res = await this.prisma.activity.findUnique({
      where: {
        id: id,
      },
      include: {
        activityActivityTypes: true,
        activityManagers: true,
      },
    });
    if (res == null) {
      return null;
    }
    return this.mapToDto(res);
  }

  async create(
    context: RequestContext,
    dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.create);

    const res = await this.prisma.activity.create({
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        activityActivityTypes: {
          createMany: {
            data: dto.activityTypeIds.map((id) => ({
              activityTypeId: id,
            })),
          },
        },
        organizationId: dto.organizationId,
        activityManagers: {
          createMany: {
            data: dto.activityManagerIds.map((id) => ({
              accountId: id,
            })),
          },
        },
      },
      include: {
        activityActivityTypes: true,
        activityManagers: true,
      },
    });
    return this.mapToDto(res);
  }

  async update(
    context: RequestContext,
    id: number,
    dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.update);

    const res = await this.prisma.activity.update({
      where: {
        id: id,
      },
      data: {
        name: dto.name,
        description: dto.description,
        thumbnail: dto.thumbnail,
        activityActivityTypes: {
          deleteMany: {},
          createMany: {
            data: dto.activityTypeIds.map((id) => ({
              activityTypeId: id,
            })),
          },
        },
        organizationId: dto.organizationId,
        activityManagers: {
          deleteMany: {},
          createMany: {
            data: dto.activityManagerIds.map((id) => ({
              accountId: id,
            })),
          },
        },
      },
      include: {
        activityActivityTypes: true,
        activityManagers: true,
      },
    });

    return this.mapToDto(res);
  }

  async delete(
    context: RequestContext,
    id: number,
  ): Promise<ActivityOutputDto> {
    this.logCaller(context, this.delete);
    const res = await this.prisma.activity.delete({
      where: {
        id: id,
      },
      include: {
        activityActivityTypes: true,
        activityManagers: true,
      },
    });
    return this.mapToDto(res);
  }

  mapToDto(
    activity: Activity & {
      activityActivityTypes?: ActivityActivityType[];
      activityManagers?: ActivityManager[];
    },
  ): ActivityOutputDto {
    return this.output(ActivityOutputDto, {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      thumbnail: activity.thumbnail,
      activityTypeIds: activity.activityActivityTypes?.map(
        (activityActivityType) => activityActivityType.activityTypeId,
      ),
      activityManagerIds: activity.activityManagers?.map(
        (activityManager) => activityManager.accountId,
      ),
      organizationId: activity.organizationId,
    });
  }
}

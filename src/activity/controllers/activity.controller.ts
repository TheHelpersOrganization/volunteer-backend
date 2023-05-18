import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import {
  ActivityOutputDto,
  GetActivitiesQueryDto,
  GetActivityByIdQueryDto,
  UpdateActivityInputDto,
} from '../dtos';
import { CreateActivityInputDto } from '../dtos/create-activity.input.dto';
import { ActivityService } from '../services';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
    @Query() query: GetActivitiesQueryDto,
  ): Promise<ActivityOutputDto[]> {
    return this.activityService.getAll(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetActivityByIdQueryDto,
  ): Promise<ActivityOutputDto | null> {
    return this.activityService.getById(context, id, query);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    return this.activityService.create(context, dto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateActivityInputDto,
  ): Promise<ActivityOutputDto> {
    return this.activityService.update(context, id, dto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ActivityOutputDto> {
    return this.activityService.delete(context, id);
  }
}

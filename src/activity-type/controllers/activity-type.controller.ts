import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import {
  ActivityTypeOutputDto,
  CreateOrUpdateActivityTypeInputDto,
  CreateOrUpdateActivityTypeOutputDto,
} from '../dtos';
import { ActivityTypeService } from '../services';

@Controller('activity-types')
export class ActivityTypeController {
  constructor(private readonly activityTypeService: ActivityTypeService) {}

  @Get()
  async getAll(
    @ReqContext() context: RequestContext,
  ): Promise<CreateOrUpdateActivityTypeOutputDto[]> {
    return this.activityTypeService.getAll(context);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityTypeOutputDto> {
    return this.activityTypeService.getById(context, id);
  }

  @Post('create-or-update')
  async createOrUpdate(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateOrUpdateActivityTypeInputDto,
  ): Promise<CreateOrUpdateActivityTypeOutputDto> {
    return this.activityTypeService.createOrUpdate(context, dto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActivityTypeOutputDto> {
    return this.activityTypeService.delete(context, id);
  }
}

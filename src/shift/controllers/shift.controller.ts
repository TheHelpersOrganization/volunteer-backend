import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import {
  CreateShiftInputDto,
  GetShiftByIdQueryDto,
  GetShiftQueryDto,
  ShiftOutputDto,
} from '../dtos';
import { ShiftService } from '../services';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  async get(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto[]> {
    return this.shiftService.getShifts(context, query);
  }

  @Get(':id')
  async getShiftById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetShiftByIdQueryDto,
  ): Promise<ShiftOutputDto | null> {
    return this.shiftService.getById(context, id, query);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    return this.shiftService.create(context, dto);
  }
}

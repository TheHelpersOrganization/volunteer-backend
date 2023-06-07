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
  CreateShiftInputDto,
  GetShiftQueryDto,
  GetShiftsQueryDto,
  ShiftOutputDto,
  UpdateShiftInputDto,
} from '../dtos';
import { ShiftService } from '../services';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  async get(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftsQueryDto,
  ): Promise<ShiftOutputDto[]> {
    return this.shiftService.getShifts(context, query);
  }

  @Get(':id')
  async getShiftById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Query() query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto | null> {
    return this.shiftService.getShiftById(context, id, query);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    return this.shiftService.createShift(context, dto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateShiftInputDto,
    @Query() query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto> {
    return this.shiftService.updateShift(context, id, dto, query);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.shiftService.deleteShift(context, id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { ShiftOutputDto, UpdateShiftInputDto } from '../dtos';
import { GetShiftQueryDto } from '../dtos/get-shift.query.dto';
import { ModShiftService } from '../services';

@Controller('mod/shifts')
export class ModShiftController {
  constructor(private readonly modShiftService: ModShiftService) {}

  @Get()
  async get(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftQueryDto,
  ): Promise<ShiftOutputDto[]> {
    return this.modShiftService.getShifts(context, query);
  }

  @Get(':id')
  async getById(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.modShiftService.getShiftById(context, id);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
    @Body() dto: UpdateShiftInputDto,
  ): Promise<ShiftOutputDto> {
    return this.modShiftService.updateShift(context, id, dto);
  }

  @Delete(':id')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('id') id: number,
  ): Promise<ShiftOutputDto | null> {
    return this.modShiftService.deleteShift(context, id);
  }
}

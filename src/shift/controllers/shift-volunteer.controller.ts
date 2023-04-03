import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  CreateShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  UpdateShiftVolunteerInputDto,
  UpdateShiftVolunteerStatus,
} from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('shifts/:shiftId/volunteers')
export class ShiftVolunteerController {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

  // @Get(':id')
  // async getById(
  //   @ReqContext() context: RequestContext,
  //   @Param('shiftId') shiftId: number,
  //   @Param('id') id: number,
  // ): Promise<ShiftVolunteerOutputDto | null> {
  //   return this.shiftVolunteerService.getById(context, shiftId, id);
  // }

  @Get('me')
  async getMe(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    return this.shiftVolunteerService.getMe(context, shiftId);
  }

  @Post('join')
  async join(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.join(context, shiftId);
  }

  @Put('cancel-join')
  async cancelJoin(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.cancelJoin(context, shiftId);
  }

  @Put('leave')
  async leave(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.leave(context, shiftId);
  }

  // -- Mod --

  @Get()
  async getByShiftId(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto[]> {
    return this.shiftVolunteerService.getByShiftId(context, shiftId);
  }

  @Post()
  async create(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Body() dto: CreateShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.create(context, shiftId, dto);
  }

  @Put(':id')
  async update(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
    @Body() dto: UpdateShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.update(context, shiftId, id, dto);
  }

  @Put(':id/registration/status')
  async updateStatus(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
    @Body() dto: UpdateShiftVolunteerStatus,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.updateRegistrationStatus(
      context,
      shiftId,
      id,
      dto,
    );
  }

  @Put(':id/status')
  async delete(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.remove(context, shiftId, id);
  }
}

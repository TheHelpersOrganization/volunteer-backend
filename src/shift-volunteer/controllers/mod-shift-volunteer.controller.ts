import { Role } from '@app/auth/constants';
import { RequireRoles } from '@app/auth/decorators';
import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateShiftVolunteerInputDto,
  GetShiftVolunteerQueryDto,
  ReviewShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  UpdateShiftVolunteerStatus,
} from '../dtos';
import { ModShiftVolunteerService, ShiftVolunteerService } from '../services';

@RequireRoles(Role.Moderator)
@Controller('mod/shift-volunteers')
export class ModShiftVolunteerController {
  constructor(
    private readonly shiftVolunteerService: ShiftVolunteerService,
    private readonly modShiftVolunteerService: ModShiftVolunteerService,
  ) {}

  @Get()
  async getShiftVolunteers(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftVolunteerQueryDto,
  ) {
    return this.modShiftVolunteerService.getShiftVolunteers(context, query);
  }

  @Get('count/status')
  async countShiftVolunteersStatus(
    @ReqContext() context: RequestContext,
    @Query() query: GetShiftVolunteerQueryDto,
  ) {
    return this.modShiftVolunteerService.countStatus(context, query);
  }

  @Get(':id')
  async getShiftVolunteerById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ShiftVolunteerOutputDto | null> {
    return this.shiftVolunteerService.getById(context, id);
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
    @Body() dto: ReviewShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.review(context, shiftId, id, dto);
  }

  @Put(':id/registration/status')
  async updateStatus(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
    @Body() dto: UpdateShiftVolunteerStatus,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.approveOrReject(
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

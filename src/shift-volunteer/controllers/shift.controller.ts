import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { ShiftVolunteerStatus } from '../constants';
import {
  ReviewShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  VerifyCheckInInputDto,
  VerifyVolunteerCheckInByIdInputDto,
} from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('shifts/:shiftId/volunteers')
export class IdentifiedShiftVolunteerController {
  constructor(private readonly shiftVolunteerService: ShiftVolunteerService) {}

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

  @Put(':id/approve')
  async approve(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.updateRegistrationStatus(
      context,
      shiftId,
      id,
      {
        status: ShiftVolunteerStatus.Approved,
      },
    );
  }

  @Put(':id/reject')
  async reject(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.updateRegistrationStatus(
      context,
      shiftId,
      id,
      {
        status: ShiftVolunteerStatus.Rejected,
      },
    );
  }

  @Put(':id/remove')
  async remove(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.remove(context, shiftId, id);
  }

  @Put('check-in')
  async checkIn(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.checkIn(context, shiftId);
  }

  @Put('check-out')
  async checkOut(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.checkOut(context, shiftId);
  }

  @Put('verify-check-in')
  async verifyCheckIn(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Body() dto: VerifyCheckInInputDto,
  ): Promise<ShiftVolunteerOutputDto[]> {
    return this.shiftVolunteerService.verifyCheckIn(context, shiftId, dto);
  }

  @Put(':id/verify-check-in')
  async verifyCheckInById(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
    @Body() dto: VerifyVolunteerCheckInByIdInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.verifyCheckInById(
      context,
      shiftId,
      id,
      dto,
    );
  }

  @Put(':id/review')
  async update(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
    @Body() dto: ReviewShiftVolunteerInputDto,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.review(context, shiftId, id, dto);
  }
}

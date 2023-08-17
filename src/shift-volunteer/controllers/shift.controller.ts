import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ShiftVolunteerAuthService } from '../auth';
import { ShiftVolunteerStatus } from '../constants';
import {
  ApproveManyShiftVolunteer,
  RateActivityInputDto,
  RejectManyShiftVolunteer,
  RemoveManyShiftVolunteer,
  ReviewShiftVolunteerInputDto,
  ShiftVolunteerOutputDto,
  VerifyCheckInInputDto,
  VerifyVolunteerCheckInByIdInputDto,
} from '../dtos';
import { ShiftVolunteerService } from '../services';

@Controller('shifts/:shiftId/volunteers')
export class IdentifiedShiftVolunteerController {
  constructor(
    private readonly shiftVolunteerService: ShiftVolunteerService,
    private readonly shiftVolunteerAuthService: ShiftVolunteerAuthService,
  ) {}

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

  @Put('approve')
  async approveMany(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Body() dto: ApproveManyShiftVolunteer,
  ) {
    return this.shiftVolunteerService.approveMany(context, shiftId, dto);
  }

  @Put('reject')
  async rejectMany(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Body() dto: RejectManyShiftVolunteer,
  ) {
    return this.shiftVolunteerService.approveMany(context, shiftId, dto);
  }

  @Put('remove')
  async removeMany(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Body() dto: RemoveManyShiftVolunteer,
  ) {
    return this.shiftVolunteerService.removeMany(context, shiftId, dto);
  }

  @Put(':id/approve')
  async approve(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.approveOrReject(context, shiftId, id, {
      status: ShiftVolunteerStatus.Approved,
    });
  }

  @Put(':id/reject')
  async reject(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
    @Param('id') id: number,
  ): Promise<ShiftVolunteerOutputDto> {
    return this.shiftVolunteerService.approveOrReject(context, shiftId, id, {
      status: ShiftVolunteerStatus.Rejected,
    });
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
  ) {
    return this.shiftVolunteerService.verifyCheckInMany(context, shiftId, dto);
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

  @Post('rate')
  async rateActivity(
    @ReqContext() context: RequestContext,
    @Param('shiftId', ParseIntPipe) shiftId: number,
    @Body() dto: RateActivityInputDto,
  ) {
    const volunteer = await this.shiftVolunteerAuthService.validateCanRateShift(
      {
        accountId: context.account.id,
        shiftId: shiftId,
      },
    );
    return this.shiftVolunteerService.rateActivity(context, shiftId, dto, {
      useVolunteer: volunteer,
    });
  }
}

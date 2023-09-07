import { ReqContext, RequestContext } from '@app/common/request-context';
import { ShiftVolunteerStatus } from '@app/shift-volunteer/constants';
import { ShiftVolunteerOutputDto } from '@app/shift-volunteer/dtos';
import { Controller, Param, Put } from '@nestjs/common';

@Controller('test/shifts/:shiftId/volunteers')
export class TestShiftController {
  @Put('check-in')
  async checkIn(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    const output: ShiftVolunteerOutputDto = {
      id: 1,
      accountId: context.account.id,
      shiftId: shiftId,
      status: ShiftVolunteerStatus.Approved,
      active: true,
      attendant: true,
      checkedIn: true,
      checkedOut: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return output;
  }

  @Put('check-out')
  async checkOut(
    @ReqContext() context: RequestContext,
    @Param('shiftId') shiftId: number,
  ): Promise<ShiftVolunteerOutputDto> {
    const output: ShiftVolunteerOutputDto = {
      id: 1,
      accountId: context.account.id,
      shiftId: shiftId,
      status: ShiftVolunteerStatus.Approved,
      active: true,
      attendant: true,
      checkedIn: true,
      checkedOut: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return output;
  }
}

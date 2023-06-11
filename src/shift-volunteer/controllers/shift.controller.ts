import { Controller, Param, Post, Put } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { ShiftVolunteerOutputDto } from '../dtos';
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
}

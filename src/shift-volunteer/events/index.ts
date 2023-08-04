import { AbstractEvent } from '@app/common/events';
import { RequestContext } from '@app/common/request-context';
import { ShiftOutputDto } from '@app/shift/dtos';
import { ShiftVolunteerOutputDto } from '../dtos';

export class ShiftVolunteerReviewedEvent extends AbstractEvent {
  static eventName = 'shift.volunteer.reviewed';

  constructor(
    context: RequestContext,
    public readonly shift: ShiftOutputDto,
    public readonly previous: ShiftVolunteerOutputDto,
    public readonly next: ShiftVolunteerOutputDto,
  ) {
    super(context);
  }
}

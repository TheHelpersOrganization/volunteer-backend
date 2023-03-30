import { Expose } from 'class-transformer';
import { VolunteerShiftStatus } from '../constants';

export class ShiftVolunteerOutputDto {
  @Expose()
  shiftId: number;

  @Expose()
  accountId: number;

  @Expose()
  attendant: boolean;

  @Expose()
  completion: number;

  @Expose()
  status: VolunteerShiftStatus;
}

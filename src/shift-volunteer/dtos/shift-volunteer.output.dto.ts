import { Expose } from 'class-transformer';
import { ShiftVolunteerStatus } from '../constants';

export class ShiftVolunteerOutputDto {
  @Expose()
  id: number;

  @Expose()
  shiftId: number;

  @Expose()
  accountId: number;

  @Expose()
  attendant: boolean;

  @Expose()
  completion: number;

  @Expose()
  status: ShiftVolunteerStatus;
}

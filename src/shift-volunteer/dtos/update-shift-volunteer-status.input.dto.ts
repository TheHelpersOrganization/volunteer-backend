import { IsIn } from 'class-validator';
import { ShiftVolunteerStatus } from '../constants';

export class UpdateShiftVolunteerStatus {
  @IsIn([ShiftVolunteerStatus.Approved, ShiftVolunteerStatus.Rejected])
  status: ShiftVolunteerStatus;
}

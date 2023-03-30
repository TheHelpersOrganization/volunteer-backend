import { IsIn } from 'class-validator';
import { VolunteerShiftStatus } from '../constants';

export class UpdateShiftVolunteerStatus {
  @IsIn([VolunteerShiftStatus.Approved, VolunteerShiftStatus.Rejected])
  status: VolunteerShiftStatus;
}

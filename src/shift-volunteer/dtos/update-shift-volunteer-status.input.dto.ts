import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
} from 'class-validator';
import { ShiftVolunteerStatus } from '../constants';

export class UpdateShiftVolunteerStatus {
  @IsIn([ShiftVolunteerStatus.Approved, ShiftVolunteerStatus.Rejected])
  status: ShiftVolunteerStatus;
}

export class ApproveManyShiftVolunteer {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  volunteerIds: number[];
}

export class RejectManyShiftVolunteer {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  volunteerIds: number[];
}

export class RemoveManyShiftVolunteer {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(256)
  volunteerIds: number[];
}

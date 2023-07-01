import { Expose, Type } from 'class-transformer';
import {
  ShiftVolunteerErrorOutputDto,
  ShiftVolunteerOutputDto,
} from './shift-volunteer.output.dto';

export class UpdateManyShiftVolunteerStatusOutputDto {
  @Expose()
  @Type(() => ShiftVolunteerOutputDto)
  success: ShiftVolunteerOutputDto[];

  @Expose()
  @Type(() => ShiftVolunteerErrorOutputDto)
  error: ShiftVolunteerErrorOutputDto[];
}

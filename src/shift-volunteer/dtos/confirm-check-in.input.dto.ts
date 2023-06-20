import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  ValidateNested,
} from 'class-validator';

export class VerifyVolunteerCheckInByIdInputDto {
  @IsBoolean()
  checkIn: boolean;

  @IsBoolean()
  checkOut: boolean;
}

export class VerifyVolunteerCheckInInputDto {
  @IsInt()
  id: number;

  @IsBoolean()
  checkIn: boolean;

  @IsBoolean()
  checkOut: boolean;
}

export class VerifyCheckInInputDto {
  @Type(() => VerifyVolunteerCheckInInputDto)
  @IsArray()
  @ArrayMaxSize(256)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  volunteers: VerifyVolunteerCheckInInputDto[];
}

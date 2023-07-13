import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ReviewShiftVolunteerInputDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completion: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reviewNote: string;
}

import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MAX_SHIFT_RATING_COMMENT_LENGTH } from '../constants';

export class RateActivityInputDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_SHIFT_RATING_COMMENT_LENGTH)
  comment?: string;
}

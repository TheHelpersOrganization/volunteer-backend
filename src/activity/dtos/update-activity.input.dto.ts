import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFileId } from 'src/file/validators';

export class UpdateActivityInputDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  skillIds?: number[];

  @IsOptional()
  @IsFileId()
  thumbnail?: number;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  activityManagerIds?: number[];
}

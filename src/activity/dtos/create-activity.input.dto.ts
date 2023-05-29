import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsFileId } from 'src/file/validators';

export class CreateActivityInputDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsFileId()
  thumbnail?: number;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @IsArray()
  activityManagerIds?: number[];
}

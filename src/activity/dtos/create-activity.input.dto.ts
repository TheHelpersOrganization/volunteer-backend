import { IsArray, IsNumber, IsString } from 'class-validator';
import { IsFileId } from 'src/file/validators';

export class CreateActivityInputDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber(undefined, { each: true })
  @IsArray()
  activityTypeIds: number[];

  @IsFileId()
  thumbnail: number;

  @IsNumber()
  organizationId: number;

  @IsNumber(undefined, { each: true })
  @IsArray()
  activityManagerIds: number[];
}

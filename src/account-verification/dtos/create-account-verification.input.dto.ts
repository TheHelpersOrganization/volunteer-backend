import { IsFileId } from '@app/file/validators';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAccountVerificationInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsFileId({ each: true })
  files?: number[];
}

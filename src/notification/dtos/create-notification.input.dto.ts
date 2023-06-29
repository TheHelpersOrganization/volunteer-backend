import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationInputDto {
  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  shortDescription?: string;
}

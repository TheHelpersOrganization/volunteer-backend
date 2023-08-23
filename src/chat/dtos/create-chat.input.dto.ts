import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { CHAT_GROUP_NAME_MAX_LENGTH } from '../constants';

export class CreateChatInputDto {
  @IsInt()
  to: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  initialMessage?: string;
}

export class CreateChatGroupInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(CHAT_GROUP_NAME_MAX_LENGTH)
  name?: string;

  @IsInt({ each: true })
  to: number[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  initialMessage?: string;
}

import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateChatInputDto {
  @IsInt()
  to: number;

  @IsString()
  @MaxLength(1000)
  initialMessage: string;
}

import { IsString, MaxLength } from 'class-validator';

export class CreateMessageInputDto {
  @IsString()
  @MaxLength(1000)
  message: string;
}

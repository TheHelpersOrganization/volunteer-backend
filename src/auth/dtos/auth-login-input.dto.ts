import { EMAIL_MAX_LENGTH } from '@app/account/constants/account.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginInput {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  password: string;
}

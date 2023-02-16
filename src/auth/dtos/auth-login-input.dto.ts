import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { EMAIL_MAX_LENGTH } from 'src/account/constants/account.constant';

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

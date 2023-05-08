import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description?: string;
}

export class CreateRoleOutputDto {
  @Expose()
  name: string;

  @Expose()
  description?: string;
}

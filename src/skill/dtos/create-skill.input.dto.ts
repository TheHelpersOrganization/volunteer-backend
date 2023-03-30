import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSkillInputDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

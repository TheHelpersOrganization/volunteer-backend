import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSkillInputDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;
}

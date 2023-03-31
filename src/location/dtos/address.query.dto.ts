import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AddressQueryDto {
  @IsString()
  @MaxLength(1000)
  address: string;

  @IsOptional()
  @IsString()
  sessionToken?: string;

  @IsOptional()
  location?: string;
}

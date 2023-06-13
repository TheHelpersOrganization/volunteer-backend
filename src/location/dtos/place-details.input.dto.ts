import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PlaceDetailsInputDto {
  @IsString()
  @MaxLength(1000)
  placeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sessionToken?: string;
}

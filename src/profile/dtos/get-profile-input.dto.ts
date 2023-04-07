import { IsArray, IsInt, IsOptional } from 'class-validator';

export class GetProfileInputDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ids?: number[];
}

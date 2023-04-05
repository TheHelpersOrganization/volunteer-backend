import { IsOptional, IsString } from 'class-validator';

export class RejectOrganizationInputDto {
  @IsOptional()
  @IsString()
  verifierComment: string;
}

import { IsOptional, IsString } from 'class-validator';

export class RejectMemberInputDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

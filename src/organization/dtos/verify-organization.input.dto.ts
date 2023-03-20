import { IsBoolean } from 'class-validator';

export class VerifyOrganizationInputDto {
  @IsBoolean()
  isVerified: boolean;
}

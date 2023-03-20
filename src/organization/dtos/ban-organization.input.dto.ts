import { IsBoolean } from 'class-validator';

export class DisableOrganizationInputDto {
  @IsBoolean()
  isDisabled: boolean;
}

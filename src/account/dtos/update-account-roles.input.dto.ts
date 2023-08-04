import { Role } from '@app/auth/constants';
import { IsArray, IsEnum } from 'class-validator';

export class UpdateAccountRolesInputDto {
  @IsEnum(Role, { each: true })
  @IsArray()
  roles: Role[];
}

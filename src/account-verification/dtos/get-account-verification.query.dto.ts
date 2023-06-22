import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos';
import { AccountVerificationStatus } from '../constants';

export enum GetAccountVerificationInclude {
  File = 'file',
  History = 'history',
}

export class GetAccountVerificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GetAccountVerificationInclude, { each: true })
  @Transform(({ value }) => value.split(','))
  include?: GetAccountVerificationInclude[];
}

export class GetAccountVerificationsQueryDto extends GetAccountVerificationQueryDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => value.split(',').map(parseInt))
  id?: number[];

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  accountId?: number;

  @IsOptional()
  @IsEnum(AccountVerificationStatus, { each: true })
  @Transform(({ value }) => value.split(','))
  status?: AccountVerificationStatus[];
}

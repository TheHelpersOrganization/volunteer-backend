import { FileOutputDto } from '@app/file/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccountVerificationStatus } from '../constants';

export class AccountVerificationOutputDto {
  @Expose()
  id: number;

  @Expose()
  accountId: number;

  @Expose()
  status: AccountVerificationStatus;

  @Expose()
  @ApiProperty()
  performedBy: number;

  @Expose()
  @ApiProperty()
  isVerified: boolean;

  @Expose()
  @ApiProperty()
  note?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Type(() => FileOutputDto)
  files?: FileOutputDto[];
}

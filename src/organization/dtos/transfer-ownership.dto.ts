import { IsInt, IsString } from 'class-validator';

export class TransferOwnershipInputDto {
  @IsInt()
  memberId: number;

  @IsString()
  password: string;
}

import { IsInt } from 'class-validator';

export class TransferOwnershipInputDto {
  @IsInt()
  memberId: number;
}

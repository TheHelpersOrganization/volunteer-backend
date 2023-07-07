import { Expose, Type } from 'class-transformer';
import { ProfileOutputDto } from 'src/profile/dtos';

export class ChatMessageOutputDto {
  @Expose()
  chatId: number;

  @Expose()
  sender: number;

  @Expose()
  message: string;

  @Expose()
  createdAt: Date;
}

export class ChatOutputDto {
  @Expose()
  id: number;

  @Expose()
  createdBy: number;

  @Expose()
  isBlocked: boolean;

  @Expose()
  blockedBy: number;

  @Expose()
  @Type(() => ChatMessageOutputDto)
  messages: ChatMessageOutputDto[];

  @Expose()
  participantIds: number[];

  @Expose()
  @Type(() => ProfileOutputDto)
  participants: ProfileOutputDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

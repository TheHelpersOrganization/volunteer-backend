import { Expose, Type } from 'class-transformer';
import { ProfileOutputDto } from 'src/profile/dtos';

export class ChatMessageOutputDto {
  @Expose()
  id: number;

  @Expose()
  chatId: number;

  @Expose()
  sender: number;

  @Expose()
  message: string;

  @Expose()
  createdAt: Date;
}

export class ChatParticipantOutputDto extends ProfileOutputDto {
  @Expose()
  read: boolean;
}

export class ChatOutputDto {
  @Expose()
  id: number;

  @Expose()
  name?: string;

  @Expose()
  createdBy: number;

  @Expose()
  isBlocked: boolean;

  @Expose()
  blockedBy: number;

  @Expose()
  isGroup: boolean;

  @Expose()
  @Type(() => ChatMessageOutputDto)
  messages: ChatMessageOutputDto[];

  @Expose()
  participantIds: number[];

  @Expose()
  @Type(() => ChatParticipantOutputDto)
  participants: ChatParticipantOutputDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

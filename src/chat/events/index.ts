import { AbstractEvent } from 'src/common/events';
import { ChatMessageOutputDto, ChatOutputDto } from '../dtos';

export class ChatMessageSentEvent extends AbstractEvent {
  static readonly eventName = 'chat.message.sent';

  readonly message: ChatMessageOutputDto;

  constructor(context, message: ChatMessageOutputDto) {
    super(context);
    this.message = message;
  }
}

export class ChatBlockedEvent extends AbstractEvent {
  static readonly eventName = 'chat.blocked';

  readonly chat: ChatOutputDto;

  constructor(context, chat: ChatOutputDto) {
    super(context);
    this.chat = chat;
  }
}

export class ChatUnblockedEvent extends AbstractEvent {
  static readonly eventName = 'chat.unblocked';

  readonly chat: ChatOutputDto;

  constructor(context, chat: ChatOutputDto) {
    super(context);
    this.chat = chat;
  }
}

import { BaseApiException } from 'src/common/exceptions';

export class ChatNotFoundException extends BaseApiException {
  constructor() {
    super('No chat found', undefined, 404);
  }
}

export class ChatIsBlockedException extends BaseApiException {
  constructor() {
    super('Chat is blocked');
  }
}

export class ChatIsNotBlockedException extends BaseApiException {
  constructor() {
    super('Chat is not blocked');
  }
}

export class HaveNotJoinedChatException extends BaseApiException {
  constructor() {
    super('You have not joined this chat');
  }
}

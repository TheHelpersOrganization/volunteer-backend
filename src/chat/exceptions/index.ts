import { BaseApiException } from 'src/common/exceptions';

export class NoChatFoundException extends BaseApiException {
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

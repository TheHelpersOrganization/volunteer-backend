import { BaseApiException } from '@app/common/exceptions';

export class ChatNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'No chat found', status: 404 });
  }
}

export class ChatIsBlockedException extends BaseApiException {
  constructor() {
    super({ message: 'Chat is blocked' });
  }
}

export class ChatIsNotBlockedException extends BaseApiException {
  constructor() {
    super({ message: 'Chat is not blocked' });
  }
}

export class HaveNotJoinedChatException extends BaseApiException {
  constructor() {
    super({ message: 'You have not joined this chat' });
  }
}

export class ChatParticipantNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Chat participant not found', status: 404 });
  }
}

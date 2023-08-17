import { BaseApiException } from '@app/common/exceptions';

export class UnableToVerifySelfAccountException extends BaseApiException {
  constructor() {
    super({ message: 'Unable to verify your own account' });
  }
}

export class AccountAlreadyVerifiedException extends BaseApiException {
  constructor() {
    super({ message: 'Account already verified' });
  }
}

export class AccountIsAlreadyAwaitingVerificationException extends BaseApiException {
  constructor() {
    super({ message: 'Account is already awaiting verification' });
  }
}

export class NoPendingAccountVerificationException extends BaseApiException {
  constructor() {
    super({ message: 'No pending account verification' });
  }
}

export class NoBlockedAccountVerificationException extends BaseApiException {
  constructor() {
    super({ message: 'No blocked account verification' });
  }
}

export class BlockedAccountVerificationException extends BaseApiException {
  constructor() {
    super({ message: 'Account verification is blocked' });
  }
}

export class AccountVerificationIsBlockedException extends BaseApiException {
  constructor() {
    super({ message: 'Account verification is blocked' });
  }
}

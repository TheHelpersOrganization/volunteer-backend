import { BaseApiException } from 'src/common/exceptions';

export class UnableToVerifySelfAccountException extends BaseApiException {
  constructor() {
    super('Unable to verify your own account');
  }
}

export class AccountAlreadyVerifiedException extends BaseApiException {
  constructor() {
    super('Account already verified');
  }
}

export class AccountIsAlreadyAwaitingVerificationException extends BaseApiException {
  constructor() {
    super('Account is already awaiting verification');
  }
}

export class NoPendingAccountVerificationException extends BaseApiException {
  constructor() {
    super('No pending account verification');
  }
}

export class NoBlockedAccountVerificationException extends BaseApiException {
  constructor() {
    super('No blocked account verification');
  }
}

export class BlockedAccountVerificationException extends BaseApiException {
  constructor() {
    super('Account verification is blocked');
  }
}

export class AccountVerificationIsBlockedException extends BaseApiException {
  constructor() {
    super('Account verification is blocked');
  }
}

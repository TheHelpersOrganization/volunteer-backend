import { BaseApiException } from 'src/common/exceptions';

export class UnableToVerifySelfAccountException extends BaseApiException {
  constructor() {
    super('Unable to verify your own account');
  }
}

export class UnableToBanSelfAccountException extends BaseApiException {
  constructor() {
    super('Unable to ban your own account');
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

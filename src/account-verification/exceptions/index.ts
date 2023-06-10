import { BaseApiException } from 'src/common/exceptions';

export class AccountHasNoPendingVerificationRequestException extends BaseApiException {
  constructor() {
    super('Account has no pending verification request');
  }
}

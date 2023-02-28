import { BaseApiException } from 'src/common/exceptions';

export class EarlyOtpRenewalException extends BaseApiException {
  constructor() {
    super('OTP renewal request is too early');
  }
}

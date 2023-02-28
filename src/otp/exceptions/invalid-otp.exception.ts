import { BaseApiException } from 'src/common/exceptions';

export class InvalidOtpException extends BaseApiException {
  constructor() {
    super('The OTP is invalid or has been expired');
  }
}

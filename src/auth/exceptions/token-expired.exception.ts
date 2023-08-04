import { BaseApiException } from '@app/common/exceptions';

export class LoginSessionExpiredException extends BaseApiException {
  constructor() {
    super(
      'Your login session has expired. Please re-login again',
      'login-session-expired',
      401,
    );
  }
}

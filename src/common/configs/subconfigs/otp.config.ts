import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  lifeSec: parseInt(process.env.OTP_LIFE_SEC),
  passwordResetRenewSec: parseInt(process.env.OTP_RESET_PASSWORD_RENEW_SEC),
  emailVerificationResetRenewSec: parseInt(
    process.env.OTP_EMAIL_VERIFICATION_RENEW_SEC,
  ),
}));

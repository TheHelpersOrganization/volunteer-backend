import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  lifeSec: parseInt(process.env.OTP_LIFE_SEC),
  passwordResetRenewSec: parseInt(process.env.OTP_RESET_PASSWORD_RENEWAL_SEC),
  emailVerificationResetRenewSec: parseInt(
    process.env.OTP_EMAIL_VERIFICATION_RENEWAL_SEC,
  ),
}));

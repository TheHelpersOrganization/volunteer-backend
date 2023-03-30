import { registerAs } from '@nestjs/config';

export default registerAs('otp', () => ({
  lifeSec: parseInt(process.env.OTP_LIFE_SEC || '5 * 60 * 60'),
  passwordResetRenewSec: parseInt(
    process.env.OTP_RESET_PASSWORD_RENEWAL_SEC || '0',
  ),
  emailVerificationResetRenewSec: parseInt(
    process.env.OTP_EMAIL_VERIFICATION_RENEWAL_SEC || '0',
  ),
}));

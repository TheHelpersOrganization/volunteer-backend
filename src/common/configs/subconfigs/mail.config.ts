import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  sendgridApiKey: process.env.SENDGRID_API_KEY,
}));

import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  default: {
    from: process.env.EMAIL_DEFAULT_FROM,
  },
}));

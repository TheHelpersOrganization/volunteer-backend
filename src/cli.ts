import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { CreateAccountInput } from './account/dtos/account-create-input.dto';
import { AccountService } from './account/services/account.service';
import { AppModule } from './app.module';
import { ROLE } from './auth/constants/role.constant';
import { RequestContext } from './common/request-context/request-context.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const configService = app.get(ConfigService);
  const defaultAdminUserPassword = configService.get<string>(
    'defaultAdminUserPassword',
  );

  const userService = app.get(AccountService);

  const defaultAdmin: CreateAccountInput = {
    password: defaultAdminUserPassword,
    isAccountDisabled: false,
    email: 'default-admin@example.com',
  };

  const ctx = new RequestContext();

  // Create the default admin user if it doesn't already exist.
  const user = await userService;
  if (!user) {
    await userService.createAccount(ctx, defaultAdmin);
  }

  await app.close();
}
bootstrap();

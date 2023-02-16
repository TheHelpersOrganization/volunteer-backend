import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createConnection, getConnection } from 'typeorm';

import { CreateAccountInput } from '../src/account/dtos/account-create-input.dto';
import { AccountOutput } from '../src/account/dtos/account-output.dto';
import { AccountService } from '../src/account/services/account.service';
import { ROLE } from '../src/auth/constants/role.constant';
import { LoginInput } from '../src/auth/dtos/auth-login-input.dto';
import { AuthTokenOutput } from '../src/auth/dtos/auth-token-output.dto';
import { RequestContext } from '../src/common/request-context/request-context.dto';

const TEST_DB_CONNECTION_NAME = 'e2e_test_connection';
export const TEST_DB_NAME = 'e2e_test_db';

export const resetDBBeforeTest = async (): Promise<void> => {
  // This overwrites the DB_NAME used in the SharedModule's TypeORM init.
  // All the tests will run against the e2e db due to this overwrite.
  process.env.DB_NAME = TEST_DB_NAME;

  console.log(`Dropping ${TEST_DB_NAME} database and recreating it`);
  const connection = await createConnection({
    name: TEST_DB_CONNECTION_NAME,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'example',
    database: 'postgres',
  });

  await connection.query(`drop database if exists ${TEST_DB_NAME}`);
  await connection.query(`create database ${TEST_DB_NAME}`);

  await connection.close();
};

export const createDBEntities = async (): Promise<void> => {
  console.log(`Creating entities in ${TEST_DB_NAME} database`);
  await createConnection({
    name: TEST_DB_CONNECTION_NAME,
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'example',
    database: TEST_DB_NAME,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true,
  });
};

export const seedAdminAccount = async (
  app: INestApplication,
): Promise<{
  adminUser: AccountOutput;
  authTokenForAdmin: AuthTokenOutput;
}> => {
  const defaultAdmin: CreateAccountInput = {
    password: 'default-admin-password',
    roles: [ROLE.ADMIN],
    isAccountDisabled: false,
    email: 'default-admin@example.com',
  };

  const ctx = new RequestContext();

  // Creating Admin User
  const userService = app.get(AccountService);
  const userOutput = await userService.createAccount(ctx, defaultAdmin);

  const loginInput: LoginInput = {
    username: defaultAdmin.username,
    password: defaultAdmin.password,
  };

  // Logging in Admin User to get AuthToken
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginInput)
    .expect(HttpStatus.OK);

  const authTokenForAdmin: AuthTokenOutput = loginResponse.body.data;

  const adminUser: AccountOutput = JSON.parse(JSON.stringify(userOutput));

  return { adminUser, authTokenForAdmin };
};

export const closeDBAfterTest = async (): Promise<void> => {
  console.log(`Closing connection to ${TEST_DB_NAME} database`);
  const connection = await getConnection(TEST_DB_CONNECTION_NAME);

  await connection.close();
};

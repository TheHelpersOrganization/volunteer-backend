import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { hashSync } from 'bcrypt';
import { AccountOutputDto } from 'src/account/dtos';
import { AuthService } from 'src/auth/services';
import { RequestContext } from 'src/common/request-context';
import { PrismaService } from 'src/prisma';
import { RoleService } from 'src/role/services';
import { AppModule } from '../src/app.module';
import { Role } from '../src/auth/constants/role.constant';
import { LoginInput } from '../src/auth/dtos/auth-login-input.dto';
import { RefreshTokenInput } from '../src/auth/dtos/auth-refresh-token-input.dto';
import { RegisterInput } from '../src/auth/dtos/auth-register-input.dto';
import { AccountTokenOutputDto } from '../src/auth/dtos/auth-token-output.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let account: AccountOutputDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const prismaService = app.get(PrismaService);
    const hashedPassword = hashSync('123456', 10);

    await prismaService.account.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
      },
    });

    await app.get(RoleService).createDefaultRoles(new RequestContext());
  });

  afterAll(async () => {
    const prismaService = app.get(PrismaService);
    await prismaService.deleteAllData();
    await app.close();
  });

  describe('register a new user', () => {
    const registerInput: RegisterInput = {
      password: '123456',
      roles: [Role.Volunteer],
      isAccountDisabled: false,
      email: 'volunteer@test.com',
    };

    const registerOutput = {
      roles: [Role.Volunteer],
      email: 'volunteer@test.com',
      isAccountDisabled: false,
    };

    it('successfully register a new account', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerInput)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          const resp = res.body;
          expect(resp.data).toEqual(expect.objectContaining(registerOutput));
        });
    });

    it('register fails with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerInput, email: 'invalid-email' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('register fails with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerInput, password: '' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('login the registered user', () => {
    const loginInput: LoginInput = {
      email: 'volunteer@test.com',
      password: '123456',
    };

    it('should successfully login the user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInput)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const token = res.body.data.token;
          expect(token).toHaveProperty('accessToken');
          expect(token).toHaveProperty('refreshToken');
        });
    });

    it('should failed to login with wrong credential', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...loginInput, password: 'wrong-pass' })
        .expect(HttpStatus.NOT_FOUND);
    });

    // TODO : Should fail when isAccountDisabled is set to true.
  });

  describe('refreshing jwt token', () => {
    const loginInput: LoginInput = {
      email: 'volunteer@test.com',
      password: '123456',
    };

    it('should successfully get new auth token using refresh token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInput);

      const token: AccountTokenOutputDto = loginResponse.body.data;
      const refreshTokenInput: RefreshTokenInput = {
        refreshToken: token.token.refreshToken,
      };

      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send(refreshTokenInput)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const data = res.body.data.token;
          expect(data).toHaveProperty('accessToken');
          expect(data).toHaveProperty('refreshToken');
        });
    });
  });

  describe('verify account email', () => {
    const loginInput: LoginInput = {
      email: 'volunteer@test.com',
      password: '123456',
    };

    it('should verify account successfully', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginInput);

      const otp = await app
        .get(AuthService)
        .createVerifyAccountToken(
          new RequestContext(),
          loginResponse.body.data.account.id,
          {
            noEarlyRenewalCheck: true,
          },
        );

      return request(app.getHttpServer())
        .post('/auth/verify-account')
        .send({
          email: loginInput.email,
          token: otp,
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          const data: AccountOutputDto = res.body.data;
          expect(data.isEmailVerified).toBe(true);
        });
    });
  });
});

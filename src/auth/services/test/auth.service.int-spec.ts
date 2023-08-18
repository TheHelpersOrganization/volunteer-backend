import { AccountModule } from '@app/account/account.module';
import { Role } from '@app/auth/constants';
import { RegisterOutput } from '@app/auth/dtos';
import { EmailAlreadyInUseException } from '@app/auth/exceptions';
import { AccountNotFoundException } from '@app/auth/exceptions/account-not-found.exception';
import { CommonModule } from '@app/common/common.module';
import { RequestContext } from '@app/common/request-context';
import { EmailModule } from '@app/email/email.module';
import { RoleModule } from '@app/role/role.module';
import { RoleService } from '@app/role/services';
import { TokenType } from '@app/token/constants';
import { TokenService } from '@app/token/services';
import { TokenModule } from '@app/token/token.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';

describe('AuthService Integration', () => {
  let roleService: RoleService;
  let authService: AuthService;
  let tokenService: TokenService;
  const context = new RequestContext();

  let account: RegisterOutput;
  const email = 'test001';
  const password = 'pass0123456';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CommonModule,
        AccountModule,
        TokenModule,
        EmailModule,
        JwtModule.registerAsync({
          imports: [CommonModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('auth.secret'),
          }),
          inject: [ConfigService],
        }),
        RoleModule,
      ],
      providers: [AuthService],
    }).compile();

    roleService = moduleRef.get<RoleService>(RoleService);
    authService = moduleRef.get<AuthService>(AuthService);
    tokenService = moduleRef.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('create roles', () => {
    it('should create roles successfully', async () => {
      const volunteerRole = await roleService.createRole(context, {
        name: Role.Volunteer,
      });

      expect(volunteerRole).toBeDefined();
      expect(volunteerRole.name).toBe(Role.Volunteer);

      const moderatorRole = await roleService.createRole(context, {
        name: Role.Moderator,
      });

      expect(moderatorRole).toBeDefined();
      expect(moderatorRole.name).toBe(Role.Moderator);

      const adminRole = await roleService.createRole(context, {
        name: Role.Admin,
      });

      expect(adminRole).toBeDefined();
      expect(adminRole.name).toBe(Role.Admin);
    });
  });

  describe('register', () => {
    it('should create account successfully', async () => {
      account = await authService.register(context, {
        email: email,
        password: password,
        isAccountDisabled: false,
      });

      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      expect(account.email).toBe(email);
      expect(account.isAccountDisabled).toBe(false);
    });

    it('should throw error when register with existed email', async () => {
      const promise = authService.register(context, {
        email: email,
        password: 'password',
        isAccountDisabled: false,
      });

      await expect(promise).rejects.toThrow(EmailAlreadyInUseException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const token = await authService.validateAccount(
        context,
        account.email,
        password,
      );

      expect(token).toBeDefined();
      expect(token.id).toBe(account.id);
      expect(token.email).toBe(account.email);
    });

    it('should throw error when using wrong email password', async () => {
      const promise = authService.validateAccount(context, 'abcdef', password);

      await expect(promise).rejects.toThrow(AccountNotFoundException);
    });

    it('should return valid token', async () => {
      context.account = account;
      const accountToken = await authService.login(context);

      expect(accountToken).toBeDefined();
      expect(accountToken.account).toMatchObject({
        email: account.email,
        id: account.id,
      });
      expect(accountToken.token).toBeDefined();
      expect(accountToken.token.accessToken).toBeDefined();
      expect(accountToken.token.refreshToken).toBeDefined();
    });

    it('should return valid token when refresh token', async () => {
      context.account = account;
      const accountToken = await authService.refreshToken(context);

      expect(accountToken).toBeDefined();
      expect(accountToken.account).toMatchObject({
        email: account.email,
        id: account.id,
      });
      expect(accountToken.token).toBeDefined();
      expect(accountToken.token.accessToken).toBeDefined();
      expect(accountToken.token.refreshToken).toBeDefined();
    });
  });

  describe('verify email', () => {
    let token: string;

    it('should create token successfully', async () => {
      context.account = account;
      token = await tokenService.createToken(
        context,
        account.id,
        TokenType.EmailVerification,
      );

      expect(token).toBeDefined();
    });

    it('should verify email successfully', async () => {
      context.account = account;
      const verifiedAccount = await authService.verifyAccount(context, {
        email: account.email,
        token: token,
      });

      expect(verifiedAccount).toBeDefined();
      expect(verifiedAccount.id).toBe(account.id);
      expect(verifiedAccount.isAccountVerified).toBe(true);
    });
  });
});

import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AccountModule } from 'src/account/account.module';
import { AuthService } from 'src/auth/services';
import { CommonModule } from 'src/common/common.module';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { EmailModule } from 'src/email/email.module';
import { OtpModule } from 'src/otp/otp.module';
import { RoleModule } from 'src/role/role.module';
import { AuthController } from '..';

describe('AuthController Integration', () => {
  let authController: AuthController;
  let authService: AuthService;
  const context = new RequestContext();
  const email = 'controller-test@a.com';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CommonModule,
        AccountModule,
        OtpModule,
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
      controllers: [AuthController],
      providers: [AuthService, AppLogger],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const account = await authController.register(context, {
        email: email,
        password: 'pass0123456',
        isAccountDisabled: false,
      });

      expect(account).toBeDefined();
      expect(account.id).toBe(expect.any(Number));
      expect(account.email).toBe(email);
      expect(account.isAccountDisabled).toBe(false);

      expect(authService.register).toBeCalledTimes(1);
    });
  });
});

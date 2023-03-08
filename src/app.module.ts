import { Module } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CommonModule } from './common/common.module';
import { ResponseInterceptor } from './common/interceptors';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { OtpModule } from './otp/otp.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    CommonModule,
    AccountModule,
    AuthModule,
    ProfileModule,
    OtpModule,
    EmailModule,
    FileModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

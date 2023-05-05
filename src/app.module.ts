import { Module, ValidationPipe } from '@nestjs/common';

import { AccountModule } from './account/account.module';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CommonModule } from './common/common.module';
import { ResponseInterceptor } from './common/interceptors';
import { VALIDATION_PIPE_OPTIONS } from './common/pipes';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { LocationModule } from './location/location.module';
import { OrganizationModule } from './organization/organization.module';
import { OtpModule } from './otp/otp.module';
import { ProfileModule } from './profile/profile.module';
import { ShiftModule } from './shift/shift.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    CommonModule,
    AccountModule,
    AuthModule,
    ProfileModule,
    OtpModule,
    EmailModule,
    OrganizationModule,
    FileModule,
    LocationModule,
    SkillModule,
    ShiftModule,
    ActivityModule,
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
    {
      provide: 'APP_PIPE',
      useFactory: () => new ValidationPipe(VALIDATION_PIPE_OPTIONS),
    },
  ],
})
export class AppModule {}

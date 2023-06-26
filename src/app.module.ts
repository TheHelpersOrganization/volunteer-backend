import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AccountVerificationModule } from './account-verification/account-verification.module';
import { AccountModule } from './account/account.module';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, ResponseInterceptor } from './common/interceptors';
import { RequestIdMiddleware } from './common/middlewares';
import { VALIDATION_PIPE_OPTIONS } from './common/pipes';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { LocationModule } from './location/location.module';
import { NotificationModule } from './notification/notification.module';
import { OrganizationModule } from './organization/organization.module';
import { OtpModule } from './otp/otp.module';
import { ProfileModule } from './profile/profile.module';
import { ReportModule } from './report/report.module';
import { ShiftSkillModule } from './shift-skill/shift-skill.module';
import { ShiftVolunteerModule } from './shift-volunteer/shift-volunteer.module';
import { ShiftModule } from './shift/shift.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    CommonModule,
    AccountModule,
    AccountVerificationModule,
    AuthModule,
    ProfileModule,
    OtpModule,
    EmailModule,
    OrganizationModule,
    FileModule,
    LocationModule,
    SkillModule,
    ShiftModule,
    ShiftVolunteerModule,
    ShiftSkillModule,
    ActivityModule,
    NotificationModule,
    ReportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe(VALIDATION_PIPE_OPTIONS),
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

import { CommonModule } from '@app/common/common.module';
import emailConfig from '@app/common/configs/subconfigs/email.config';
import { rootProjectPath } from '@app/common/utils';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { OtpModule } from '@app/otp/otp.module';
import { EmailListener, EmailService } from './services';

@Module({
  imports: [
    CommonModule,
    MailerModule.forRootAsync({
      inject: [emailConfig.KEY],
      useFactory: (emailConfigApi: ConfigType<typeof emailConfig>) => ({
        transport: {
          host: emailConfigApi.host,
          port: emailConfigApi.port,
          secure: true,
          auth: {
            user: emailConfigApi.user,
            pass: emailConfigApi.password,
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: emailConfigApi.default.from,
        },
        template: {
          dir: `${rootProjectPath}/templates`,
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    OtpModule,
  ],
  providers: [EmailService, EmailListener],
  exports: [EmailService],
})
export class EmailModule {}

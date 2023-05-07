import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import emailConfig from 'src/common/configs/subconfigs/email.config';
import { rootProjectPath } from 'src/common/utils';

import { OtpModule } from 'src/otp/otp.module';
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

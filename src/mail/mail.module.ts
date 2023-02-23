import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';

import { MailController } from './controllers/mail.controller';
import { MailService } from './services';

@Module({
  imports: [CommonModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}

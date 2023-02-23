import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    SendGrid.setApiKey(this.configService.get('mail.sendgridApiKey'));
    logger.setContext(MailService.name);
  }

  async send(ctx: RequestContext, mail: SendGrid.MailDataRequired) {
    this.logger.log(ctx, `${MailService.name}.${this.send.name} is called`);
    const transport = await SendGrid.send(mail);
    return transport;
  }
}

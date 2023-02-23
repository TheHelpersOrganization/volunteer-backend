import { Controller, Post } from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';

import { MailService } from '../services';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('get')
  async test(@ReqContext() ctx: RequestContext) {
    return this.mailService.send(ctx, {
      from: 'cyberprotonatmailbox@gmail.com',
      to: 'cyberprotonatmailbox@gmail.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'Hello',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    });
  }
}

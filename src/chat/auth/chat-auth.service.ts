import { AppLogger } from '@app/common/logger';
import { RequestContext } from '@app/common/request-context';
import { AbstractService } from '@app/common/services';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatGroupService } from '../services';

@Injectable()
export class ChatAuthService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly chatGroupService: ChatGroupService,
  ) {
    super(logger);
  }

  async validateIsChatGroupOwner(context: RequestContext, chatId: number) {
    const res = await this.chatGroupService.getChatGroupOrThrow(
      context,
      chatId,
    );
    if (res.ownerId !== context.account.id) {
      throw new ForbiddenException();
    }
    return res;
  }
}

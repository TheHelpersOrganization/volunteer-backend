import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_JWT_AUTH_WEBSOCKET } from '../constants';

export class WsAuthGuard extends AuthGuard(STRATEGY_JWT_AUTH_WEBSOCKET) {
  constructor() {
    super();
  }

  override getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}

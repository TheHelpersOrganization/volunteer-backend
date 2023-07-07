import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';

@WebSocketGateway(undefined, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway extends AbstractService {
  @WebSocketServer()
  server: Server;

  constructor(logger: AppLogger) {
    super(logger);
  }

  @SubscribeMessage('send')
  handleEvent(@MessageBody() data: any): string {
    this.logCaller(undefined, data);

    this.server.sockets.emit('send', data);
    return `Server say ${data}`;
  }
}

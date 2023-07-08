import {
  ParseIntPipe,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/auth/guards/jwt-auth-ws.guard';
import { AllExceptionsFilter } from 'src/common/filters';
import { LoggingInterceptor } from 'src/common/interceptors';
import { RequestIdInterceptor } from 'src/common/interceptors/request-id.interceptor';
import { AppLogger } from 'src/common/logger';
import { VALIDATION_PIPE_OPTIONS } from 'src/common/pipes';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { CreateMessageInputDto } from '../dtos';
import { ChatNotFoundException } from '../exceptions';
import { ChatService } from '../services';

@WebSocketGateway(undefined, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@UseInterceptors(RequestIdInterceptor, LoggingInterceptor)
@UseFilters(AllExceptionsFilter)
@UseGuards(WsAuthGuard)
@UsePipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
export class ChatGateway
  extends AbstractService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    logger: AppLogger,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {
    super(logger);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization?.split(' ')?.[1];
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      this.jwtService.verify(token);
      this.logger.log(null, `Client connected: ${client.id}`);
    } catch (err) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(null, `Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat')
  async joinChat(
    @ReqContext() context: RequestContext,
    @ConnectedSocket() client: Socket,
    @MessageBody(ParseIntPipe) chatId: number,
  ) {
    const chat = await this.chatService.getChatById(context, chatId, {});
    if (!chat) {
      throw new ChatNotFoundException();
    }
    await client.join(`chat-${chat.id}`);
    this.logger.log(context, `Client ${client.id} joined chat ${chat.id}`);
    return chat;
  }

  @SubscribeMessage('leave-chat')
  async leaveChat(
    @ReqContext() context: RequestContext,
    @ConnectedSocket() client: Socket,
    @MessageBody(ParseIntPipe) chatId: number,
  ) {
    if (!client.rooms.has(`chat-${chatId}`)) {
      return;
    }
    await client.leave(`chat-${chatId}`);
    this.logger.log(context, `Client ${client.id} left chat ${chatId}`);
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @ReqContext() context: RequestContext,
    @MessageBody() data: CreateMessageInputDto,
  ) {
    this.logCaller(context, this.sendMessage);
    await this.chatService.sendChatMessage(context, data);
    this.server.sockets.to(`chat-${data.chatId}`).emit('receive-message', data);
  }
}

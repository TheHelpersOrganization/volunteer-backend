import {
  ParseIntPipe,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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
import { TokenExpiredError } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { LoginSessionExpiredException } from 'src/auth/exceptions';
import { WsAuthGuard } from 'src/auth/guards/jwt-auth-ws.guard';
import { AllExceptionsFilter, toErrorObject } from 'src/common/filters';
import {
  LoggingInterceptor,
  ResponseInterceptor,
} from 'src/common/interceptors';
import { RequestIdInterceptor } from 'src/common/interceptors/request-id.interceptor';
import { AppLogger } from 'src/common/logger';
import { VALIDATION_PIPE_OPTIONS } from 'src/common/pipes';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { CreateMessageInputDto } from '../dtos';
import {
  ChatBlockedEvent,
  ChatMessageSentEvent,
  ChatReadEvent,
  ChatUnblockedEvent,
} from '../events';
import { HaveNotJoinedChatException } from '../exceptions';
import { ChatService } from '../services';

@WebSocketGateway(undefined, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@UseInterceptors(RequestIdInterceptor, LoggingInterceptor, ResponseInterceptor)
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
    // Check the handshake auth for the auth token
    let token = client.handshake.auth.token;
    // If the token is not in the handshake auth, check the headers
    if (token == null) {
      token = client.handshake.headers.authorization?.split(' ')?.[1];
    }
    if (!token) {
      client.emit(
        'error',
        toErrorObject(new UnauthorizedException('No auth token'), {
          hideInternalDetailError: false,
        }),
      );
      client.disconnect(true);
      return;
    }
    try {
      this.jwtService.verify(token);
      this.logger.log(null, `Client connected: ${client.id}`);
    } catch (err) {
      if (
        err instanceof TokenExpiredError ||
        err.name === 'TokenExpiredError'
      ) {
        client.emit('error', {
          ...toErrorObject(new LoginSessionExpiredException(), {
            hideInternalDetailError: false,
          }),
        });
      } else {
        client.emit('error', toErrorObject(err));
      }
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
  ) {
    const accountId = context.account.id;
    await client.join(`chat-${accountId}`);
    this.logger.log(context, `Client ${client.id} joined chat ${accountId}`);
  }

  @SubscribeMessage('leave-chat')
  async leaveChat(
    @ReqContext() context: RequestContext,
    @ConnectedSocket() client: Socket,
  ) {
    const accountId = context.account.id;
    if (!client.rooms.has(`chat-${accountId}`)) {
      throw new HaveNotJoinedChatException();
    }
    await client.leave(`chat-${accountId}`);
    this.logger.log(context, `Client ${client.id} left chat ${accountId}`);
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @ReqContext() context: RequestContext,
    @MessageBody() data: CreateMessageInputDto,
  ) {
    this.logCaller(context, this.sendMessage);
    const message = await this.chatService.sendChatMessage(context, data);
    return message;
  }

  @SubscribeMessage('block-chat')
  async blockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.blockChat(context, data);
    return chat;
  }

  @SubscribeMessage('unblock-chat')
  async unblockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.unblockChat(context, data);
    return chat;
  }

  @SubscribeMessage('read-chat')
  async readChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.readChat(context, data);
    return chat;
  }

  @OnEvent(ChatMessageSentEvent.eventName)
  async onReceiveMessage(event: ChatMessageSentEvent) {
    this.logCaller(event.context, this.onReceiveMessage);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('receive-message', event.message);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatBlockedEvent.eventName)
  async onChatBlocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatBlocked);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-blocked', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatUnblockedEvent.eventName)
  async onChatUnblocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatUnblocked);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-unblocked', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatReadEvent.eventName)
  async onChatRead(event: ChatReadEvent) {
    this.logCaller(event.context, this.onChatRead);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-read', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }
}

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
  ChatUnblockedEvent,
} from '../events';
import {
  ChatNotFoundException,
  HaveNotJoinedChatException,
} from '../exceptions';
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
      throw new HaveNotJoinedChatException();
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
    const message = await this.chatService.sendChatMessage(context, data);
    // this.server.sockets
    //   .to(`chat-${data.chatId}`)
    //   .emit('receive-message', message);
    return message;
  }

  @SubscribeMessage('block-chat')
  async blockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.blockChat(context, data);
    //this.server.sockets.to(`chat-${chat.id}`).emit('chat-blocked', chat);
    return chat;
  }

  @SubscribeMessage('unblock-chat')
  async unblockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.unblockChat(context, data);
    //this.server.sockets.to(`chat-${chat.id}`).emit('chat-unblocked', chat);
    return chat;
  }

  @OnEvent(ChatMessageSentEvent.eventName)
  async onReceiveMessage(event: ChatMessageSentEvent) {
    this.logCaller(event.context, this.onReceiveMessage);
    this.server.sockets
      .to(`chat-${event.message.chatId}`)
      .emit('receive-message', event.message);
  }

  @OnEvent(ChatBlockedEvent.eventName)
  async onChatBlocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatBlocked);
    this.server.sockets
      .to(`chat-${event.chat.id}`)
      .emit('chat-blocked', event.chat);
  }

  @OnEvent(ChatUnblockedEvent.eventName)
  async onChatUnblocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatUnblocked);
    this.server.sockets
      .to(`chat-${event.chat.id}`)
      .emit('chat-unblocked', event.chat);
  }
}

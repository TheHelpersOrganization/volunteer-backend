import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ReqContext, RequestContext } from 'src/common/request-context';
import {
  ChatMessagesQueryDto,
  ChatQueryDto,
  ChatsQueryDto,
  CreateMessageInputDto,
} from '../dtos';
import { ChatService } from '../services';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getChats(
    @ReqContext() context: RequestContext,
    @Query() query: ChatsQueryDto,
  ) {
    return this.chatService.getChats(context, query);
  }

  @Get(':id')
  async getChatById(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatQueryDto,
  ) {
    return this.chatService.getChatById(context, id, query);
  }

  @Get(':id/messages')
  async getChatMessages(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatMessagesQueryDto,
  ) {
    return this.chatService.getChatMessages(context, id, query);
  }

  @Post('send')
  async sendChatMessage(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateMessageInputDto,
  ) {
    return this.chatService.sendChatMessage(context, dto);
  }

  @Post(':id/block')
  async blockChat(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.blockChat(context, id);
  }

  @Post(':id/unblock')
  async unblockChat(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.unblockChat(context, id);
  }
}

import { ReqContext, RequestContext } from '@app/common/request-context';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ChatMessagesQueryDto,
  ChatQueryDto,
  ChatsQueryDto,
  CreateMessageInputDto,
} from '../dtos';
import {
  CreateChatGroupInputDto,
  CreateChatInputDto,
} from '../dtos/create-chat.input.dto';
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

  @Get('to/:accountId')
  async getChatToAccount(
    @ReqContext() context: RequestContext,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: ChatQueryDto,
  ) {
    return this.chatService.getChatToAccountByAccountId(
      context,
      accountId,
      query,
    );
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

  @Post()
  async createChat(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateChatInputDto,
  ) {
    return this.chatService.createChat(context, dto);
  }

  @Post('group')
  async createChatGroup(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateChatGroupInputDto,
  ) {
    return this.chatService.createChatGroup(context, dto);
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

  @Post(':id/read')
  async readChat(
    @ReqContext() context: RequestContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.readChat(context, id);
  }
}

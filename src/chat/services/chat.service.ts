import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { requireNonNullish } from 'prisma/seed/utils';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';
import { getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import {
  ChatMessagesQueryDto,
  ChatQueryDto,
  ChatQueryInclude,
  ChatQuerySort,
  ChatsQueryDto,
  CreateMessageInputDto,
} from '../dtos';
import { ChatMessageOutputDto, ChatOutputDto } from '../dtos/chat.output.dto';
import {
  ChatIsBlockedException,
  ChatIsNotBlockedException,
  ChatNotFoundException,
} from '../exceptions';

@Injectable()
export class ChatService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {
    super(logger);
  }

  async getChats(context: RequestContext, query: ChatsQueryDto) {
    this.logCaller(context, this.getChats);

    const chats = await this.prisma.chat.findMany({
      where: this.getChatWhere(query, context.account.id),
      include: this.getChatInclude(query.include, {
        messageLimit: query.messageLimit,
        messageOffset: query.messageOffset,
      }),
      orderBy: this.getChatOrderBy(query.sort),
      take: query.limit,
      skip: query.offset,
    });

    return Promise.all(chats.map((chat) => this.mapToDto(context, chat)));
  }

  async getChatById(context: RequestContext, id: number, query: ChatQueryDto) {
    this.logCaller(context, this.getChatById);

    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
        ChatParticipant: {
          some: {
            accountId: context.account.id,
          },
        },
      },
      include: this.getChatInclude(query.include, {
        messageLimit: query.messageLimit,
        messageOffset: query.messageOffset,
      }),
    });

    if (!chat) {
      return null;
    }

    return this.mapToDto(context, chat);
  }

  getChatWhere(query: ChatsQueryDto, requesterId: number) {
    const where: Prisma.ChatWhereInput = {
      ChatParticipant: {
        some: {
          accountId: requesterId,
        },
      },
    };

    if (query.name) {
      requireNonNullish(where.ChatParticipant).some = {
        ...where.ChatParticipant?.some,
        Account: {
          profile: {
            OR: [
              {
                username: {
                  contains: query.name,
                  mode: 'insensitive',
                },
                firstName: {
                  contains: query.name,
                  mode: 'insensitive',
                },
                lastName: {
                  contains: query.name,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      };
    }

    if (query.isBlocked) {
      where.isBlocked = query.isBlocked;
    }

    if (query.isGroup) {
      where.isGroup = query.isGroup;
    }

    if (Object.keys(where).length === 0) {
      return undefined;
    }

    return where;
  }

  getChatInclude(
    includes?: ChatQueryInclude[],
    extra?: { messageLimit?: number; messageOffset?: number },
  ) {
    const include: Prisma.ChatInclude = {
      ChatParticipant: true,
    };

    if (includes?.includes(ChatQueryInclude.Message)) {
      include.ChatMessage = {
        orderBy: {
          createdAt: 'desc',
        },
        take: extra?.messageLimit,
        skip: extra?.messageOffset,
      };
    }

    if (Object.keys(include).length === 0) {
      return undefined;
    }

    return include;
  }

  getChatOrderBy(sort?: ChatQuerySort) {
    if (!sort) {
      return undefined;
    }
    const orderBy: Prisma.ChatOrderByWithAggregationInput = {};
    switch (sort) {
      case ChatQuerySort.CreatedAtAsc:
        orderBy.createdAt = 'asc';
        break;
      case ChatQuerySort.CreatedAtDesc:
        orderBy.createdAt = 'desc';
        break;
      case ChatQuerySort.UpdatedAtAsc:
        orderBy.updatedAt = 'asc';
        break;
      case ChatQuerySort.UpdatedAtDesc:
        orderBy.updatedAt = 'desc';
        break;
    }
    return orderBy;
  }

  async getChatMessages(
    context: RequestContext,
    id: number,
    query: ChatMessagesQueryDto,
  ) {
    this.logCaller(context, this.getChatMessages);

    await this.getChatOrThrow(context, id);
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit,
      skip: query.offset,
    });

    return this.outputArray(ChatMessageOutputDto, messages);
  }

  async sendChatMessage(context: RequestContext, dto: CreateMessageInputDto) {
    this.logCaller(context, this.sendChatMessage);

    const chat = await this.getChatOrThrow(context, dto.chatId);

    if (chat.isBlocked) {
      throw new ChatIsBlockedException();
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: { ...dto, chatId: dto.chatId, sender: context.account.id },
      });
      await tx.chat.update({
        where: {
          id: dto.chatId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
      return message;
    });

    return this.output(ChatMessageOutputDto, message);
  }

  async blockChat(context: RequestContext, id: number) {
    this.logCaller(context, this.blockChat);

    const chat = await this.getChatOrThrow(context, id);

    if (chat.isBlocked) {
      throw new ChatIsBlockedException();
    }

    const res = await this.prisma.chat.update({
      where: {
        id: id,
      },
      data: {
        isBlocked: true,
        blockedBy: context.account.id,
        blockedAt: new Date(),
      },
      include: this.getChatInclude(),
    });

    return this.mapToDto(context, res);
  }

  async unblockChat(context: RequestContext, id: number) {
    this.logCaller(context, this.unblockChat);

    const chat = await this.getChatOrThrow(context, id);

    if (!chat.isBlocked) {
      throw new ChatIsNotBlockedException();
    }

    const res = await this.prisma.chat.update({
      where: {
        id: id,
      },
      data: {
        isBlocked: false,
        blockedBy: null,
        blockedAt: null,
      },
      include: this.getChatInclude(),
    });

    return this.mapToDto(context, res);
  }

  async getChatOrThrow(context: RequestContext, id: number) {
    this.logCaller(context, this.getChatOrThrow);

    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
        ChatParticipant: {
          some: {
            accountId: context.account.id,
          },
        },
      },
    });

    if (!chat) {
      throw new ChatNotFoundException();
    }

    return chat;
  }

  async mapToDto(context: RequestContext, raw: any) {
    const participantIds = raw.ChatParticipant?.map((p) => p.accountId);
    const participants =
      participantIds == null
        ? undefined
        : await this.profileService.getProfiles(context, {
            ids: participantIds,
            select: getProfileBasicSelect,
          });

    const output = {
      ...raw,
      messages: raw.ChatMessage,
      participantIds: participantIds,
      participants: participants,
    };

    return this.output(ChatOutputDto, output);
  }
}

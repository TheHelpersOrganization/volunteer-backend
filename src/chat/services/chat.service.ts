import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { requireNonNullish } from 'prisma/seed/utils';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { getProfileName, getProfileNameOrNull } from 'src/common/utils';
import { NotificationType } from 'src/notification/constants';
import { NotificationService } from 'src/notification/services';
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
  ChatBlockedEvent,
  ChatMessageSentEvent,
  ChatReadEvent,
  ChatUnblockedEvent,
} from '../events';
import {
  ChatIsBlockedException,
  ChatIsNotBlockedException,
  ChatNotFoundException,
  ChatParticipantNotFoundException,
} from '../exceptions';

@Injectable()
export class ChatService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
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
      where.OR = [
        {
          name: {
            contains: query.name,
            mode: 'insensitive',
          },
        },
        {
          ChatParticipant: {
            some: {
              Account: {
                profile: {
                  OR: [
                    {
                      username: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                    {
                      firstName: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ];
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

    include.ChatMessage = {
      orderBy: {
        createdAt: 'desc',
      },
      take: extra?.messageLimit ?? 1,
      skip: extra?.messageOffset,
    };

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
      const otherParticipants = chat.participants
        .filter((p) => p.id !== context.account.id)
        .map((p) => p.id);
      await tx.chatParticipant.updateMany({
        where: {
          chatId: dto.chatId,
          accountId: {
            in: otherParticipants,
          },
        },
        data: {
          read: false,
        },
      });
      return message;
    });

    const chatOutput = await this.mapToDto(context, chat);

    this.eventEmitter.emit(
      ChatMessageSentEvent.eventName,
      new ChatMessageSentEvent(context, chatOutput, message),
    );

    this.notificationService.sendNotifications(context, {
      accountIds: chatOutput.participantIds,
      type: NotificationType.Chat,
      chatId: chatOutput.id,
      title:
        chatOutput.name ??
        getProfileName(
          requireNonNullish(
            chatOutput.participants.find((p) => p.id !== context.account.id),
          ),
        ),
      description: message.message,
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

    const output = await this.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatBlockedEvent.eventName,
      new ChatBlockedEvent(context, output),
    );

    return output;
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

    const output = await this.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatUnblockedEvent.eventName,
      new ChatUnblockedEvent(context, output),
    );

    return output;
  }

  async readChat(context: RequestContext, id: number) {
    this.logCaller(context, this.readChat);

    const chat = await this.getChatOrThrow(context, id);
    const chatParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId: id,
        accountId: context.account.id,
      },
    });
    if (!chatParticipant) {
      throw new ChatParticipantNotFoundException();
    }

    await this.prisma.chatParticipant.update({
      where: {
        id: chatParticipant.id,
      },
      data: {
        read: true,
      },
    });

    const output = await this.mapToDto(context, chat);

    this.eventEmitter.emit(
      ChatReadEvent.eventName,
      new ChatReadEvent(
        context,
        output,
        requireNonNullish(
          output.participants.find((p) => p.id === context.account.id),
        ),
      ),
    );

    return output;
  }

  async getChatOrThrow(
    context: RequestContext,
    id: number,
    includes?: ChatQueryInclude[],
  ) {
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
      include: this.getChatInclude(includes),
    });

    if (!chat) {
      throw new ChatNotFoundException();
    }

    return this.mapToDto(context, chat);
  }

  async mapToDto(context: RequestContext, raw: any) {
    const participantIds = raw.ChatParticipant?.map((p) => p.accountId);
    const profiles =
      participantIds == null
        ? undefined
        : await this.profileService.getProfiles(context, {
            ids: participantIds,
            select: getProfileBasicSelect,
          });
    const participants = profiles?.map((p) => ({
      ...p,
      read: raw.ChatParticipant?.find((cp) => cp.accountId === p.id)?.read,
    }));

    const output = {
      ...raw,
      name:
        raw.name ??
        getProfileNameOrNull(
          profiles?.find((p) => p.id !== context.account.id),
        ),
      messages: raw.ChatMessage,
      participantIds: participantIds,
      participants: participants,
    };

    return this.output(ChatOutputDto, output);
  }
}

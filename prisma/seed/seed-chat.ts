import { faker } from '@faker-js/faker';
import {
  Account,
  Chat,
  ChatMessage,
  ChatParticipant,
  PrismaClient,
} from '@prisma/client';
import * as _ from 'lodash';
import {
  getNextChatId,
  getNextChatMessageId,
  getNextChatParticipantId,
  requireNonNullish,
} from './utils';

export const seedChats = async (
  prisma: PrismaClient,
  accounts: Account[],
  options?: {
    runWithoutDb?: boolean;
  },
) => {
  const chats: Chat[] = [];
  const chatParticipants: ChatParticipant[] = [];
  const chatMessages: ChatMessage[] = [];

  accounts.forEach((account, index) => {
    if (index >= accounts.length - 2) {
      return;
    }
    const candidates = accounts.slice(index + 1);
    _.sampleSize(
      candidates,
      _.random(0, requireNonNullish(_.min([5, candidates.length]))),
    ).forEach((candidate) => {
      const id = getNextChatId();
      const isBlocked = faker.helpers.weightedArrayElement([
        { value: true, weight: 1 },
        { value: false, weight: 9 },
      ]);
      const blockedBy = isBlocked
        ? faker.helpers.arrayElement([account.id, candidate.id])
        : null;

      chats.push({
        id: id,
        name: faker.datatype.boolean() ? faker.lorem.words() : null,
        isBlocked: isBlocked,
        blockedBy: blockedBy,
        blockedAt: isBlocked ? new Date() : null,
        isGroup: false,
        createdBy: account.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      chatParticipants.push(
        {
          id: getNextChatParticipantId(),
          chatId: id,
          read: faker.datatype.boolean(),
          accountId: account.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: getNextChatParticipantId(),
          chatId: id,
          read: faker.datatype.boolean(),
          accountId: candidate.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );

      const messageCount = _.random(1, 10);
      for (let i = 0; i < messageCount; i++) {
        chatMessages.push({
          id: getNextChatMessageId(),
          chatId: id,
          sender: requireNonNullish(_.sample([account.id, candidate.id])),
          message: faker.lorem.paragraph(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  });

  if (options?.runWithoutDb) {
    return {
      chats: chats,
      chatParticipants: chatParticipants,
      chatMessages: chatMessages,
    };
  }

  await prisma.chat.createMany({
    data: chats,
  });

  await prisma.chatParticipant.createMany({
    data: chatParticipants,
  });

  await prisma.chatMessage.createMany({
    data: chatMessages,
  });

  return {
    chats: chats,
    chatParticipants: chatParticipants,
    chatMessages: chatMessages,
  };
};

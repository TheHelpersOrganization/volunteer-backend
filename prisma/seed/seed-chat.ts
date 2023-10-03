import { faker } from '@faker-js/faker';
import {
  Account,
  Chat,
  ChatMessage,
  ChatParticipant,
  PrismaClient,
} from '@prisma/client';
import _ from 'lodash';
import { readFileSync } from 'node:fs';
import path from 'path';
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

  const chatTemplates = loadChatTemplates(
    path.join(__dirname, `./assets/volunteer-chats.txt`),
  );
  const chatGroupTemplates = loadChatTemplates(
    path.join(__dirname, `./assets/volunteer-group-chats.txt`),
  );
  accounts.forEach((account, index) => {
    if (index >= accounts.length - 2) {
      return;
    }
    const candidates = accounts.slice(index + 1);

    _.sampleSize(
      candidates,
      _.random(0, requireNonNullish(_.min([5, candidates.length]))),
    ).forEach((candidate, candidateIndex) => {
      const chatTemplate = chatTemplates[candidateIndex % chatTemplates.length];
      const chat = generateChat({
        accountId: account.id,
        candidateId: candidate.id,
      });
      const id = chat.id;
      chats.push(chat);

      chatParticipants.push(
        generateChatParticipant({ chatId: id, accountId: account.id }),
        generateChatParticipant({ chatId: id, accountId: candidate.id }),
      );

      const messageCount = _.random(1, 10);
      for (let i = 0; i < messageCount; i++) {
        chatMessages.push({
          id: getNextChatMessageId(),
          chatId: id,
          sender: requireNonNullish(_.sample([account.id, candidate.id])),
          message:
            chatTemplate.messages[i % chatTemplate.messages.length] || 'Nice',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Generate group chats
    const groupChatCount = _.random(0, 3);
    for (let i = 0; i < groupChatCount; i++) {
      const chatGroupTemplate =
        chatGroupTemplates[i % chatGroupTemplates.length];
      const data = generateChatGroup({
        accountId: account.id,
        candidateIds: _.sampleSize(
          candidates,
          _.random(1, requireNonNullish(_.min([3, candidates.length]))),
        ).map((candidate) => candidate.id),
      });
      const id = data.chat.id;
      chats.push(data.chat);

      chatParticipants.push(...data.chatParticipants);

      const messageCount = _.random(1, 10);
      for (let i = 0; i < messageCount; i++) {
        chatMessages.push({
          id: getNextChatMessageId(),
          chatId: id,
          sender: account.id,
          message:
            chatGroupTemplate.messages[i % chatGroupTemplate.messages.length] ||
            'Nice',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
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

const generateChat = (data: { accountId: number; candidateId: number }) => {
  const id = getNextChatId();
  const isBlocked = faker.helpers.weightedArrayElement([
    { value: true, weight: 1 },
    { value: false, weight: 9 },
  ]);
  const blockedBy = isBlocked
    ? faker.helpers.arrayElement([data.accountId, data.candidateId])
    : null;
  const chat = {
    id: id,
    name: null,
    isBlocked: isBlocked,
    blockedBy: blockedBy,
    blockedAt: isBlocked ? new Date() : null,
    isGroup: false,
    avatar: null,
    createdBy: data.accountId,
    ownerId: data.accountId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return chat;
};

const generateChatGroup = (data: {
  accountId: number;
  candidateIds: number[];
  name?: string;
}) => {
  const id = getNextChatId();
  const chat = {
    id: id,
    name: data.name ?? null,
    isBlocked: false,
    blockedBy: null,
    blockedAt: null,
    isGroup: true,
    avatar: null,
    createdBy: data.accountId,
    ownerId: data.accountId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const chatParticipants = data.candidateIds.map((candidateId) => {
    return generateChatParticipant({ chatId: id, accountId: candidateId });
  });
  return { chat, chatParticipants };
};

const generateChatParticipant = (data: {
  chatId: number;
  accountId: number;
}) => {
  const read = faker.datatype.boolean();
  const chatParticipant = {
    id: getNextChatParticipantId(),
    chatId: data.chatId,
    read: read,
    accountId: data.accountId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return chatParticipant;
};

const generateChatMessage = (data: { chatId: number; sender: number }) => {
  const chatMessage = {
    id: getNextChatMessageId(),
    chatId: data.chatId,
    sender: data.sender,
    message: faker.lorem.paragraph(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return chatMessage;
};

// Example Chat Messages
// Conversation 1 - Environmental Cleanup Volunteers:
// Volunteer 1: Good morning, fellow environmental cleanup volunteers! How's the park looking today?
// Volunteer 2: It's better than last week, but there's still trash scattered around.
// Volunteer 3: We need to focus on picking up litter near the playground area.
// Volunteer 4: I'll bring extra trash bags. Let's make this place spotless!
// Volunteer 5: Don't forget to wear gloves and bring some sunscreen.
class ChatTemplate {
  conversationName?: string;
  messages: string[];
}

const loadChatTemplates = (path: string) => {
  // Parse txt file
  // Return array of ChatTemplates
  const content = readFileSync(path, 'utf-8');
  const lines = content.split('\n');
  const chatTemplates: ChatTemplate[] = [];
  let currentChatTemplate: ChatTemplate | null = null;
  lines.forEach((line) => {
    if (line.startsWith('Conversation')) {
      currentChatTemplate = new ChatTemplate();
      // Remove the prefix
      const conversationHead = line.split(' - ');
      const conversationName =
        conversationHead.length > 1 ? conversationHead[1] : undefined;
      currentChatTemplate.conversationName = conversationName;
      chatTemplates.push(currentChatTemplate);
    } else if (line.startsWith('Volunteer')) {
      if (currentChatTemplate) {
        if (!currentChatTemplate.messages) {
          currentChatTemplate.messages = [];
        }
        // Remove the prefix
        const volunteerHead = line.split(': ');
        const message =
          volunteerHead.length > 2
            ? volunteerHead.slice(1).join(': ')
            : volunteerHead[1];
        currentChatTemplate.messages.push(message);
      }
    }
  });
  return chatTemplates;
};

import { Message, User } from '@prisma/client';
import { prisma } from '../../env.js';

export type MessageVoteCountObject = {
    readonly count: number;
    readonly me: boolean | null;
};

export async function createMessageVoteCountObject(
    message: Message,
    user: User | null,
): Promise<MessageVoteCountObject> {
    const positiveCount = await prisma.messageVote.count({
        where: { messageId: message.id, positive: true },
    });
    const negativeCount = await prisma.messageVote.count({
        where: { messageId: message.id, positive: false },
    });

    const me = user
        ? (
              await prisma.messageVote.findFirst({
                  where: { messageId: message.id, userId: user.id },
                  select: { positive: true },
              })
          )?.positive ?? null
        : null;

    return {
        count: positiveCount - negativeCount,
        me,
    };
}

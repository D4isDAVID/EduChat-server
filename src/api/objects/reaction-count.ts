import { Message, User } from '@prisma/client';
import { prisma } from '../../env.js';

export type ReactionCountObject = {
    readonly emoji: string;
    readonly count: number;
    readonly me: boolean;
};

export async function createReactionCountObject(
    message: Message,
    emoji: string,
    user: User | null,
): Promise<ReactionCountObject> {
    const count = await prisma.reaction.count({
        where: { messageId: message.id, emoji },
    });

    const me =
        (user
            ? await prisma.reaction.findFirst({
                  where: { messageId: message.id, emoji, userId: user.id },
              })
            : null) !== null;

    return {
        emoji: emoji,
        count,
        me,
    };
}

export async function createReactionCountsArray(
    message: Message,
    user: User | null,
): Promise<ReactionCountObject[]> {
    const emojis = await prisma.reaction.findMany({
        where: { messageId: message.id },
        distinct: ['emoji'],
        select: { emoji: true },
    });

    return Promise.all(
        emojis.map(({ emoji }) =>
            createReactionCountObject(message, emoji, user),
        ),
    );
}

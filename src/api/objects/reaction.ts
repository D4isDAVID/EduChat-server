import { Reaction } from '@prisma/client';
import { prisma } from '../../env.js';
import { UserObject, createUserObject } from './user.js';

export type ReactionObject = {
    readonly messageId: number;
    readonly emoji: string;
    readonly user: UserObject;
};

export async function createReactionObject(
    reaction: Reaction,
): Promise<ReactionObject> {
    const user = (await prisma.user.findFirst({
        where: { id: reaction.userId },
    }))!;

    return {
        messageId: reaction.messageId,
        emoji: reaction.emoji,
        user: await createUserObject(user),
    };
}

export async function createReactionsArray(
    reactions: Reaction[],
): Promise<ReactionObject[]> {
    return Promise.all(reactions.map((r) => createReactionObject(r)));
}

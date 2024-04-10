import { Reaction } from '@prisma/client';
import { prisma } from '../../env.js';
import { UserObject, createUserObject } from './user.js';

export type ReactionObject = {
    readonly id: number;
    readonly emoji: string;

    readonly user: UserObject;
    readonly messageId: number;
};

export async function createReactionObject(
    reaction: Reaction,
): Promise<ReactionObject> {
    const user = (await prisma.user.findFirst({
        where: { id: reaction.userId },
    }))!;

    return {
        id: reaction.id,
        emoji: reaction.emoji,

        user: await createUserObject(user),
        messageId: reaction.messageId,
    };
}

export async function createReactionsArray(
    reactions: Reaction[],
): Promise<ReactionObject[]> {
    return Promise.all(reactions.map((r) => createReactionObject(r)));
}

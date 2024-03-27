import { Reaction } from '@prisma/client';
import { prisma } from '../../env.js';
import { UserObject, createUserObject } from './user.js';

export type ReactionObject = {
    readonly id: number;
    readonly emoji: string;

    readonly user: UserObject;
    readonly message: number;
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
        message: reaction.messageId,
    };
}

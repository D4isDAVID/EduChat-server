import { Message, User } from '@prisma/client';
import { prisma } from '../../env.js';
import {
    ReactionCountObject,
    createReactionCountsArray,
} from './reaction-count.js';
import { UserObject, createUserObject } from './user.js';

export type MessageObject = {
    readonly id: number;
    readonly content: string;
    readonly createdAt: string;
    readonly editedAt: string | null;
    readonly pinned: boolean;
    readonly hidden: boolean;
    readonly reactions: ReactionCountObject[];

    readonly parentId: number | null;
    readonly author: UserObject;
};

export async function createMessageObject(
    message: Message,
    user: User | null,
): Promise<MessageObject> {
    const author = (await prisma.user.findFirst({
        where: { id: message.authorId },
    }))!;

    return {
        id: message.id,
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
        editedAt: message.editedAt
            ? new Date(message.editedAt).toISOString()
            : null,
        pinned: message.pinned,
        hidden: message.hidden,
        reactions: await createReactionCountsArray(message, user),

        parentId: message.parentId,
        author: await createUserObject(author),
    };
}

export async function createMessagesArray(
    messages: Message[],
    user: User | null,
): Promise<MessageObject[]> {
    return Promise.all(messages.map((m) => createMessageObject(m, user)));
}

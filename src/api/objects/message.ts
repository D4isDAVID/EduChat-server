import { Message } from '@prisma/client';
import { prisma } from '../../env.js';
import { UserObject, createUserObject } from './user.js';

export type MessageObject = {
    readonly id: number;
    readonly content: string;
    readonly createdAt: Date;
    readonly editedAt: Date | null;
    readonly flags: number;

    readonly author: UserObject;
};

export async function createMessageObject(
    message: Message,
): Promise<MessageObject> {
    const author = (await prisma.user.findFirst({
        where: { id: message.authorId },
    }))!;

    return {
        id: message.id,
        content: message.content,
        createdAt: new Date(message.createdAt),
        editedAt: message.editedAt ? new Date(message.editedAt) : null,
        flags: message.flags,

        author: await createUserObject(author),
    };
}

export async function createMessagesArray(
    messages: Message[],
): Promise<MessageObject[]> {
    return Promise.all(messages.map((m) => createMessageObject(m)));
}

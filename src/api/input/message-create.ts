import { Prisma, User } from '@prisma/client';

export type MessageCreateObject = {
    readonly content: string;
};

export function isMessageCreateObject(
    obj: unknown,
): obj is MessageCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'content' in obj &&
        typeof obj.content === 'string'
    );
}

export function toMessageCreateInput(
    obj: MessageCreateObject,
    author: User,
): Prisma.MessageCreateInput {
    const data: Prisma.MessageCreateInput = {
        content: obj.content,
        author: {
            connect: { id: author.id },
        },
    };

    return data;
}

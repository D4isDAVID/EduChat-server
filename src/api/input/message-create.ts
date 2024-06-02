import { Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validateMessageContent } from '../validators/message-content.js';

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
): Prisma.MessageCreateInput | ApiError {
    const messageContentError = validateMessageContent(obj.content);
    if (messageContentError) return messageContentError;

    const data: Prisma.MessageCreateInput = {
        content: obj.content,
        author: { connect: { id: author.id } },
    };

    return data;
}

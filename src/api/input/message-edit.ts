import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validateMessageContent } from '../validators/message-content.js';

export type MessageEditObject = {
    readonly content?: string;
};

export function isMessageEditObject(obj: unknown): obj is MessageEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('content' in obj) || typeof obj.content === 'string')
    );
}

export function toMessageUpdateInput(
    obj: MessageEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    const data: Prisma.MessageUpdateInput = {};

    if ('content' in obj && obj.content !== message.content) {
        const messageContentError = validateMessageContent(obj.content);
        if (messageContentError) return messageContentError;

        data.content = obj.content;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

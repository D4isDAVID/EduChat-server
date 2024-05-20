import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validateMessageContent } from '../validators/message-content.js';

export type AdminMessageEditObject = {
    readonly content?: string;
    readonly pinned?: boolean;
};

export function isAdminMessageEditObject(
    obj: unknown,
): obj is AdminMessageEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('content' in obj) || typeof obj.content === 'string') &&
        (!('pinned' in obj) || typeof obj.pinned === 'boolean')
    );
}

export function toAdminMessageUpdateInput(
    obj: AdminMessageEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    const data: Prisma.MessageUpdateInput = {};

    if ('content' in obj && obj.content !== message.content) {
        const messageContentError = validateMessageContent(obj.content);
        if (messageContentError) return messageContentError;

        data.content = obj.content;
    }

    if ('pinned' in obj && obj.pinned !== message.pinned) {
        data.pinned = obj.pinned;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

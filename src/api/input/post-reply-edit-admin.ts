import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import {
    AdminMessageEditObject,
    toAdminMessageUpdateInput,
} from './message-edit-admin.js';
import { isMessageEditObject } from './message-edit.js';

export type AdminPostReplyEditObject = AdminMessageEditObject & {
    pinned?: boolean;
    hidden?: boolean;
};

export function isAdminPostReplyEditObject(
    obj: unknown,
): obj is AdminPostReplyEditObject {
    return (
        isMessageEditObject(obj) &&
        (!('pinned' in obj) || typeof obj.pinned === 'boolean') &&
        (!('hidden' in obj) || typeof obj.hidden === 'boolean')
    );
}

export function toAdminPostReplyUpdateInput(
    obj: AdminPostReplyEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    const messageData = toAdminMessageUpdateInput(obj, message);
    if (typeof messageData === 'number') return messageData;

    const data = typeof messageData === 'object' ? messageData : {};

    if ('pinned' in obj && obj.pinned !== message.pinned) {
        data.pinned = obj.pinned;
    }

    if ('hidden' in obj && obj.hidden !== message.hidden) {
        data.hidden = obj.hidden;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

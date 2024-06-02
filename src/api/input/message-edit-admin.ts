import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { supersede } from '../utils/supersede-input.js';
import {
    MessageEditObject,
    isMessageEditObject,
    toMessageUpdateInput,
} from './message-edit.js';

export type AdminMessageEditObject = MessageEditObject & {
    readonly pinned?: boolean;
};

export function isAdminMessageEditObject(
    obj: unknown,
): obj is AdminMessageEditObject {
    return (
        isMessageEditObject(obj) &&
        (!('pinned' in obj) || typeof obj.pinned === 'boolean')
    );
}

export function toAdminMessageUpdateInput(
    obj: AdminMessageEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    const data = supersede(toMessageUpdateInput(obj, message), {});
    if (typeof data !== 'object') return data;

    if ('pinned' in obj && obj.pinned !== message.pinned) {
        data.pinned = obj.pinned;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

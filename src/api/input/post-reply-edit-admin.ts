import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import {
    AdminMessageEditObject,
    toAdminMessageUpdateInput,
} from './message-edit-admin.js';
import { isMessageEditObject } from './message-edit.js';

export type AdminPostReplyEditObject = AdminMessageEditObject;

export function isAdminPostReplyEditObject(
    obj: unknown,
): obj is AdminPostReplyEditObject {
    return (
        isMessageEditObject(obj) &&
        (!('hidden' in obj) || typeof obj.hidden === 'boolean')
    );
}

export function toAdminPostReplyUpdateInput(
    obj: AdminPostReplyEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    const data = toAdminMessageUpdateInput(obj, message);
    return data;
}

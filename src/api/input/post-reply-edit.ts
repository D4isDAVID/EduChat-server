import { Message, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import {
    MessageEditObject,
    isMessageEditObject,
    toMessageUpdateInput,
} from './message-edit.js';

export type PostReplyEditObject = MessageEditObject;

export function isPostReplyEditObject(
    obj: unknown,
): obj is PostReplyEditObject {
    return isMessageEditObject(obj);
}

export function toPostReplyUpdateInput(
    obj: PostReplyEditObject,
    message: Message,
): Prisma.MessageUpdateInput | ApiError | false {
    return toMessageUpdateInput(obj, message);
}

import { Post, Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import {
    MessageCreateObject,
    isMessageCreateObject,
    toMessageCreateInput,
} from './message-create.js';

export type PostReplyCreateObject = MessageCreateObject;

export function isPostReplyCreateObject(
    obj: unknown,
): obj is PostReplyCreateObject {
    return isMessageCreateObject(obj);
}

export function toPostReplyCreateInput(
    obj: PostReplyCreateObject,
    author: User,
    post: Post,
): Prisma.MessageCreateInput | ApiError {
    const data = toMessageCreateInput(obj, author);
    if (typeof data !== 'object') return data;

    data.parent = { connect: { id: post.messageId } };

    return data;
}

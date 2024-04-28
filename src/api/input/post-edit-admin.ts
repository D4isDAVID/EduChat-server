import { Message, Post, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validatePostTitle } from '../validators/post-title.js';
import {
    MessageEditObject,
    isMessageEditObject,
    toMessageUpdateInput,
} from './message-edit.js';

export type AdminPostEditObject = {
    readonly message?: MessageEditObject;
    readonly title?: string;
    readonly locked?: boolean;
    readonly question?: boolean;
};

export function isAdminPostEditObject(
    obj: unknown,
): obj is AdminPostEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('message' in obj) || isMessageEditObject(obj.message)) &&
        (!('title' in obj) || typeof obj.title === 'string') &&
        (!('pinned' in obj) || typeof obj.pinned === 'boolean') &&
        (!('locked' in obj) || typeof obj.locked === 'boolean') &&
        (!('question' in obj) || typeof obj.question === 'boolean')
    );
}

export function toAdminPostUpdateInput(
    obj: AdminPostEditObject,
    post: Post & { message: Message },
): Prisma.PostUpdateInput | ApiError | false {
    const data: Prisma.PostUpdateInput = {};

    if ('message' in obj) {
        const messageData = toMessageUpdateInput(obj.message, post.message);
        if (typeof messageData === 'number') return messageData;

        if (messageData) data.message = { update: messageData };
    }

    if ('title' in obj && obj.title !== post.title) {
        const titleError = validatePostTitle(obj.title);
        if (titleError) return titleError;

        data.title = obj.title;
    }

    if ('locked' in obj && obj.locked !== post.locked) {
        data.locked = obj.locked;
    }

    if ('question' in obj && obj.question !== post.question) {
        data.question = obj.question;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    if (!data.message?.update) data.message = { update: {} };
    data.message!.update!.editedAt = new Date();

    return data;
}

import { Message, Post, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { supersede } from '../utils/supersede-input.js';
import {
    AdminMessageEditObject,
    isAdminMessageEditObject,
    toAdminMessageUpdateInput,
} from './message-edit-admin.js';
import {
    PostEditObject,
    isPostEditObject,
    toPostUpdateInput,
} from './post-edit.js';

export type AdminPostEditObject = PostEditObject & {
    readonly message?: AdminMessageEditObject;
    readonly locked?: boolean;
};

export function isAdminPostEditObject(
    obj: unknown,
): obj is AdminPostEditObject {
    return (
        isPostEditObject(obj) &&
        (!('message' in obj) || isAdminMessageEditObject(obj.message)) &&
        (!('locked' in obj) || typeof obj.locked === 'boolean')
    );
}

export async function toAdminPostUpdateInput(
    obj: AdminPostEditObject,
    post: Post & { message: Message },
): Promise<Prisma.PostUpdateInput | ApiError | false> {
    const data = supersede(await toPostUpdateInput(obj, post), {});
    if (typeof data !== 'object') return data;

    if ('message' in obj) {
        const messageData = toAdminMessageUpdateInput(
            obj.message,
            post.message,
        );
        if (typeof messageData === 'number') return messageData;

        if (messageData) data.message = { update: messageData };
    }

    if ('locked' in obj && obj.locked !== post.locked) {
        data.locked = obj.locked;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    if (!data.message?.update) data.message = { update: {} };
    data.message!.update!.editedAt = new Date();

    return data;
}

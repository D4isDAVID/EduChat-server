import { Message, Post, Prisma } from '@prisma/client';
import { prisma } from '../../env.js';
import { ApiError } from '../enums/error.js';
import { validatePostTitle } from '../validators/post-title.js';
import {
    MessageEditObject,
    isMessageEditObject,
    toMessageUpdateInput,
} from './message-edit.js';

export type PostEditObject = {
    readonly message?: MessageEditObject;
    readonly title?: string;
    readonly question?: boolean;
    readonly answerId?: number | null;
};

export function isPostEditObject(obj: unknown): obj is PostEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('message' in obj) || isMessageEditObject(obj.message)) &&
        (!('title' in obj) || typeof obj.title === 'string')
    );
}

export async function toPostUpdateInput(
    obj: PostEditObject,
    post: Post & { message: Message },
): Promise<Prisma.PostUpdateInput | ApiError | false> {
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

    if ('question' in obj && obj.question !== post.question) {
        data.question = obj.question;
    }

    if ('answerId' in obj && obj.answerId !== post.answerId) {
        if (obj.answerId === null) {
            data.answer = { delete: true };
        } else {
            const reply = await prisma.message.findFirst({
                where: { id: obj.answerId },
            });
            if (!reply) return ApiError.UnknownPostReply;

            data.answer = { connect: { id: obj.answerId } };
        }
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    if (!data.message?.update) data.message = { update: {} };
    data.message!.update!.editedAt = new Date();

    return data;
}

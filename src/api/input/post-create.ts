import { Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validatePostTitle } from '../validators/post-title.js';
import {
    MessageCreateObject,
    isMessageCreateObject,
    toMessageCreateInput,
} from './message-create.js';

export type PostCreateObject = {
    readonly message: MessageCreateObject;
    readonly title: string;
    readonly question: boolean;
    readonly categoryId: number;
};

export function isPostCreateObject(obj: unknown): obj is PostCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'message' in obj &&
        isMessageCreateObject(obj.message) &&
        'title' in obj &&
        typeof obj.title === 'string' &&
        'question' in obj &&
        typeof obj.question === 'boolean' &&
        'categoryId' in obj &&
        typeof obj.categoryId === 'number'
    );
}

export async function toPostCreateInput(
    obj: PostCreateObject,
    author: User,
): Promise<Prisma.PostCreateInput | ApiError> {
    const titleError = validatePostTitle(obj.title);
    if (titleError) return titleError;

    const messageData = toMessageCreateInput(obj.message, author);
    if (typeof messageData !== 'object') return messageData;

    const data: Prisma.PostCreateInput = {
        message: { create: messageData },
        title: obj.title,
        question: obj.question,
        category: { connect: { id: obj.categoryId } },
    };

    return data;
}

import { Category, Prisma, User } from '@prisma/client';
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
};

export function isPostCreateObject(obj: unknown): obj is PostCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'message' in obj &&
        isMessageCreateObject(obj.message) &&
        'title' in obj &&
        typeof obj.title === 'string'
    );
}

export function toPostCreateInput(
    obj: PostCreateObject,
    author: User,
    category: Category,
): Prisma.PostCreateInput | ApiError {
    const titleError = validatePostTitle(obj.title);
    if (titleError) {
        return titleError;
    }

    const data: Prisma.PostCreateInput = {
        message: {
            create: toMessageCreateInput(obj.message, author),
        },
        title: obj.title,
        category: {
            connect: { id: category.id },
        },
    };

    return data;
}

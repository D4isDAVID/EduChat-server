import { Post } from '@prisma/client';
import { prisma } from '../../env.js';
import { MessageObject, createMessageObject } from './message.js';

export type PostObject = {
    readonly message: MessageObject;
    readonly title: string;
    readonly locked: boolean;
    readonly question: boolean;
    readonly answerId: number | null;

    readonly categoryId: number;
};

export async function createPostObject(post: Post): Promise<PostObject> {
    const message = (await prisma.message.findFirst({
        where: { id: post.messageId },
    }))!;

    return {
        message: await createMessageObject(message),
        title: post.title,
        locked: post.locked,
        question: post.question,
        answerId: post.answerId,

        categoryId: post.categoryId,
    };
}

export async function createPostsArray(posts: Post[]): Promise<PostObject[]> {
    return Promise.all(posts.map((p) => createPostObject(p)));
}

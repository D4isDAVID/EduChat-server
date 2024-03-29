import { Post } from '@prisma/client';
import { prisma } from '../../env.js';
import { MessageObject, createMessageObject } from './message.js';

export type PostObject = {
    readonly message: MessageObject;
    readonly title: string;
    readonly pinned: boolean;
    readonly locked: boolean;

    readonly category: number;
};

export async function createPostObject(post: Post): Promise<PostObject> {
    const message = (await prisma.message.findFirst({
        where: { id: post.messageId },
    }))!;

    return {
        message: await createMessageObject(message),
        title: post.title,
        pinned: post.pinned,
        locked: post.locked,

        category: post.categoryId,
    };
}

export async function createPostsArray(posts: Post[]): Promise<PostObject[]> {
    return Promise.all(posts.map((p) => createPostObject(p)));
}

import {
    MessageCreateObject,
    isMessageCreateObject,
} from './message-create.js';

export type PostCreateObject = {
    readonly category: number;
    readonly message: MessageCreateObject;
    readonly title: string;
};

export function isPostCreateObject(obj: unknown): obj is PostCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'category' in obj &&
        typeof obj.category === 'number' &&
        'message' in obj &&
        isMessageCreateObject(obj.message) &&
        'title' in obj &&
        typeof obj.title === 'string'
    );
}

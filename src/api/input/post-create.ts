import {
    MessageCreateObject,
    isMessageCreateObject,
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

export type MessageCreateObject = {
    readonly content: string;
};

export function isMessageCreateObject(
    obj: unknown,
): obj is MessageCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'content' in obj &&
        typeof obj.content === 'string'
    );
}

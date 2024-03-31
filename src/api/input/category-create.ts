export type CategoryCreateObject = {
    readonly name: string;
    readonly description?: string;
};

export function isCategoryCreateObject(
    obj: unknown,
): obj is CategoryCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        (!('description' in obj) || typeof obj.description === 'string')
    );
}

export type CategoryEditObject = {
    readonly name?: string;
    readonly description?: string | null;
    readonly pinned?: boolean;
    readonly locked?: boolean;
};

export function isCategoryEditObject(obj: unknown): obj is CategoryEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string') &&
        (!('description' in obj) ||
            obj.description === null ||
            typeof obj.description === 'string') &&
        (!('pinned' in obj) || typeof obj.pinned === 'boolean') &&
        (!('locked' in obj) || typeof obj.locked === 'boolean')
    );
}

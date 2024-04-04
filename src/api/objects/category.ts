import { Category } from '@prisma/client';

export type CategoryObject = {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
    readonly pinned: boolean;
    readonly locked: boolean;
    readonly parentId: number | null;
};

export async function createCategoryObject(
    category: Category,
): Promise<CategoryObject> {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        pinned: category.pinned,
        locked: category.locked,
        parentId: category.parentId,
    };
}

export async function createCategoriesArray(
    categories: Category[],
): Promise<CategoryObject[]> {
    return Promise.all(categories.map((c) => createCategoryObject(c)));
}

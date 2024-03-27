import { Category } from '@prisma/client';

export type CategoryObject = {
    readonly id: number;
    readonly name: string;
    readonly description: string | null;
    readonly flags: number;
};

export async function createCategoryObject(
    category: Category,
): Promise<CategoryObject> {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        flags: category.flags,
    };
}

export async function createCategoriesArray(
    categories: Category[],
): Promise<CategoryObject[]> {
    return Promise.all(categories.map((c) => createCategoryObject(c)));
}

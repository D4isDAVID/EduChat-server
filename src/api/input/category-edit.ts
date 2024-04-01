import { Category, Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validateCategoryDescription } from '../validators/category-description.js';
import { validateCategoryName } from '../validators/category-name.js';

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

export function toCategoryUpdateInput(
    obj: CategoryEditObject,
    category: Category,
): Prisma.CategoryUpdateInput | ApiError | false {
    const data: Prisma.CategoryUpdateInput = {};

    if ('name' in obj && obj.name !== category.name) {
        const nameError = validateCategoryName(obj.name);
        if (nameError) {
            return nameError;
        }

        data.name = obj.name;
    }

    if ('description' in obj && obj.description !== category.description) {
        if (obj.description !== null) {
            const descriptionError = validateCategoryDescription(
                obj.description,
            );
            if (descriptionError) {
                return descriptionError;
            }
        }

        data.description = obj.description;
    }

    if ('pinned' in obj && obj.pinned !== category.pinned) {
        data.pinned = obj.pinned;
    }

    if ('locked' in obj && obj.locked !== category.locked) {
        data.locked = obj.locked;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

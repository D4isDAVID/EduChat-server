import { Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { validateCategoryDescription } from '../validators/category-description.js';
import { validateCategoryName } from '../validators/category-name.js';

export type CategoryCreateObject = {
    readonly name: string;
    readonly description?: string;
    readonly parentId?: number;
};

export function isCategoryCreateObject(
    obj: unknown,
): obj is CategoryCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        (!('description' in obj) || typeof obj.description === 'string') &&
        (!('parentId' in obj) || typeof obj.parentId === 'number')
    );
}

export function toCategoryCreateInput(
    obj: CategoryCreateObject,
): Prisma.CategoryCreateInput | ApiError {
    const nameError = validateCategoryName(obj.name);
    if (nameError) {
        return nameError;
    }

    const input: Prisma.CategoryCreateInput = {
        name: obj.name,
    };

    if ('description' in obj) {
        const descriptionError = validateCategoryDescription(obj.description);
        if (descriptionError) {
            return descriptionError;
        }

        input.description = obj.description;
    }

    if ('parentId' in obj) {
        input.parent = {
            connect: { id: obj.parentId },
        };
    }

    return input;
}

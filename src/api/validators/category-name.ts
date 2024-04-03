import { ApiError } from '../enums/error.js';

export function validateCategoryName(name: string): ApiError | undefined {
    if (name.length < 1 || name.length > 72) {
        return ApiError.BadCategoryNameLength;
    }

    if (name.match(/[\n]/)) {
        return ApiError.InvalidCategoryName;
    }
}

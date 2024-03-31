import { ApiError } from '../enums/error.js';

export function validateCategoryName(name: string): ApiError | void {
    if (name.match(/[\n]/)) {
        return ApiError.BadCategoryName;
    }
}

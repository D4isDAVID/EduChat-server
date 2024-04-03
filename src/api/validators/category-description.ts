import { ApiError } from '../enums/error.js';

export function validateCategoryDescription(
    description: string,
): ApiError | undefined {
    if (description.length < 1 || description.length > 128) {
        return ApiError.BadCategoryDescriptionLength;
    }
}

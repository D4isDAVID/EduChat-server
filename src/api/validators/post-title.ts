import { ApiError } from '../enums/error.js';

export function validatePostTitle(title: string): ApiError | undefined {
    if (title.length < 1 || title.length > 72) {
        return ApiError.BadPostTitleLength;
    }

    if (title.match(/[\n]/)) {
        return ApiError.InvalidPostTitle;
    }
}

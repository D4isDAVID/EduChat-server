import { ApiError } from '../enums/error.js';

export function validatePostTitle(title: string): ApiError | void {
    if (title.match(/[\n]/)) {
        return ApiError.BadPostTitle;
    }
}

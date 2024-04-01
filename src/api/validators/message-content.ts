import { ApiError } from '../enums/error.js';

export function validateMessageContent(content: string): ApiError | void {
    if (content.length < 1 || content.length > 2000) {
        return ApiError.BadPostTitleLength;
    }
}

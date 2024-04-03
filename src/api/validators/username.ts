import { ApiError } from '../enums/error.js';

export function validateUsername(name: string): ApiError | undefined {
    if (name.length < 2 || name.length > 32) {
        return ApiError.BadUsernameLength;
    }

    if (!name.match(/^[\w-]+$/)) {
        return ApiError.BadUsernameFormat;
    }
}

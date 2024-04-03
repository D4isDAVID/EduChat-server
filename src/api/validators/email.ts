import { ApiError } from '../enums/error.js';

export function validateEmail(email: string): ApiError | undefined {
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{1,63}$/)) {
        return ApiError.BadEmailFormat;
    }
}

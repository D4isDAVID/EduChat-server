import { ApiError } from '../enums/error.js';

export function validateEmail(email: string): ApiError | void {
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{1,63}$/)) {
        return ApiError.BadEmailFormat;
    }
}

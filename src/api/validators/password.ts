import { ApiError } from '../enums/error.js';

const characterChecks = [/[a-zA-Z]/, /\d/, /[^a-zA-Z\d]/];

export function validatePassword(password: string): ApiError | void {
    if (password.length < 6 || password.length > 128) {
        return ApiError.BadPasswordLength;
    }

    if (
        characterChecks.map((r) => password.match(r)).filter((m) => !!m)
            .length < 2
    ) {
        return ApiError.BadPasswordFormat;
    }
}

import { ApiError } from '../enums/error.js';

export function supersede<T>(
    data: T | ApiError | false,
    defaultData: T,
): T | ApiError {
    return typeof data === 'boolean' ? defaultData : data;
}

import { ApiError } from '../../api/enums/error.js';
import { writeEmptyReply } from '../replies/empty.js';
import { writeErrorReply } from '../replies/error.js';
import { HttpStatusCode } from '../status.js';
import { RouteHandlerProps } from './index.js';

export function handleInputConversion<T extends {}>(
    { response }: RouteHandlerProps,
    input: T | ApiError | false,
): input is T {
    if (typeof input === 'number') {
        writeErrorReply(response, input);
        return false;
    }

    if (!input) {
        writeEmptyReply(response, HttpStatusCode.NotModified);
        return false;
    }

    return true;
}

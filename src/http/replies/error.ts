import { ServerResponse } from 'node:http';
import { ApiError } from '../../api/error.js';
import { HttpStatusCode } from '../status.js';
import { writeJsonReply } from './json.js';

const httpStatusMessages: {
    [key in HttpStatusCode]: string;
} = {
    [HttpStatusCode.OK]: '200 OK',
    [HttpStatusCode.Created]: '201 Created',
    [HttpStatusCode.NoContent]: '204 No Content',
    [HttpStatusCode.NotModified]: '304 Not Modified',
    [HttpStatusCode.BadRequest]: '400 Bad Request',
    [HttpStatusCode.Unauthorized]: '401 Unauthorized',
    [HttpStatusCode.Forbidden]: '403 Forbidden',
    [HttpStatusCode.NotFound]: '404 Not Found',
    [HttpStatusCode.MethodNotAllowed]: '405 Method Not Allowed',
    [HttpStatusCode.TooManyRequests]: '429 Too Many Request',
    [HttpStatusCode.InternalServerError]: '500 Internal Server Error',
    [HttpStatusCode.NotImplemented]: '501 Not Implemented',
};

const apiErrorStatuses: {
    [key in ApiError]: HttpStatusCode | null;
} = {
    [ApiError.Generic]: null,
};

const apiErrorMessages: {
    [key in ApiError]: string | null;
} = {
    [ApiError.Generic]: null,
};

function internalErrorReply(
    response: ServerResponse,
    {
        code: _code,
        status: _status,
    }: { code?: ApiError; status?: HttpStatusCode } = {},
) {
    const code = _code ?? ApiError.Generic;
    const status =
        _status ?? apiErrorStatuses[code] ?? HttpStatusCode.InternalServerError;

    writeJsonReply(
        response,
        {
            code,
            status,
            message: apiErrorMessages[code] ?? httpStatusMessages[status],
        },
        status,
    );
}

export function writeStatusReply(
    response: ServerResponse,
    status: HttpStatusCode,
) {
    return internalErrorReply(response, { status });
}

export function writeErrorReply(response: ServerResponse, code: ApiError) {
    return internalErrorReply(response, { code });
}

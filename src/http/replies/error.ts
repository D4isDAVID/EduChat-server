import { ServerResponse } from 'node:http';
import { ApiError } from '../../api/enums/error.js';
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
    [HttpStatusCode.Conflict]: '409 Conflict',
    [HttpStatusCode.Gone]: '410 Gone',
    [HttpStatusCode.TooManyRequests]: '429 Too Many Request',
    [HttpStatusCode.InternalServerError]: '500 Internal Server Error',
    [HttpStatusCode.NotImplemented]: '501 Not Implemented',
};

const apiErrorStatuses: {
    [key in ApiError]: HttpStatusCode | null;
} = {
    [ApiError.Generic]: null,

    [ApiError._Unknown]: null,
    [ApiError.UnknownUser]: HttpStatusCode.NotFound,

    [ApiError._Validations]: null,
    [ApiError.InvalidObject]: HttpStatusCode.BadRequest,
    [ApiError.BadUsernameFormat]: HttpStatusCode.BadRequest,
    [ApiError.BadEmailFormat]: HttpStatusCode.BadRequest,
    [ApiError.BadPasswordFormat]: HttpStatusCode.BadRequest,
    [ApiError.InvalidAuthorization]: HttpStatusCode.Unauthorized,
    [ApiError.InvalidUsername]: HttpStatusCode.Unauthorized,
    [ApiError.InvalidPassword]: HttpStatusCode.Unauthorized,

    [ApiError._Limitations]: null,
    [ApiError.UsernameUnavailable]: HttpStatusCode.Conflict,
    [ApiError.EmailTaken]: HttpStatusCode.Conflict,
    [ApiError.BadUsernameLength]: HttpStatusCode.BadRequest,
    [ApiError.BadPasswordLength]: HttpStatusCode.BadRequest,
};

const apiErrorMessages: {
    [key in ApiError]: string | null;
} = {
    [ApiError.Generic]: null,

    [ApiError._Unknown]: null,
    [ApiError.UnknownUser]: 'Unknown user',

    [ApiError._Validations]: null,
    [ApiError.InvalidObject]: 'Invalid object',
    [ApiError.BadUsernameFormat]:
        'Username must only contain alphanumeric characters, underscores or dashes',
    [ApiError.BadEmailFormat]: 'Invalid email format',
    [ApiError.BadPasswordFormat]:
        'Password must contain a mix of numbers, letters and symbols.',
    [ApiError.InvalidAuthorization]: 'Invalid authorization',
    [ApiError.InvalidUsername]: 'Invalid username',
    [ApiError.InvalidPassword]: 'Invalid password',

    [ApiError._Limitations]: null,
    [ApiError.UsernameUnavailable]: 'Username unavailable',
    [ApiError.EmailTaken]: 'This email is taken',
    [ApiError.BadUsernameLength]: 'Username must be between 2-32 characters',
    [ApiError.BadPasswordLength]: 'Password must be between 6-128 characters',
};

function internalErrorReply(
    response: ServerResponse,
    {
        code: _code,
        status: _status,
        message: _message,
    }: {
        code?: ApiError;
        status?: HttpStatusCode;
        message?: string | undefined;
    } = {},
) {
    const code = _code ?? ApiError.Generic;
    const status =
        _status ?? apiErrorStatuses[code] ?? HttpStatusCode.InternalServerError;
    const message =
        _message ?? apiErrorMessages[code] ?? httpStatusMessages[status];

    writeJsonReply(
        response,
        {
            code,
            message,
        },
        status,
    );
}

export function writeStatusReply(
    response: ServerResponse,
    status: HttpStatusCode,
    message?: string,
) {
    return internalErrorReply(response, { status, message });
}

export function writeErrorReply(
    response: ServerResponse,
    code: ApiError,
    message?: string,
) {
    return internalErrorReply(response, { code, message });
}

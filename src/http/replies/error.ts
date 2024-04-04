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
    [ApiError.UnknownCategory]: HttpStatusCode.NotFound,
    [ApiError.UnknownPost]: HttpStatusCode.NotFound,
    [ApiError.UnknownPostReply]: HttpStatusCode.NotFound,

    [ApiError._Validations]: null,
    [ApiError.InvalidObject]: HttpStatusCode.BadRequest,
    [ApiError.BadUsernameFormat]: HttpStatusCode.BadRequest,
    [ApiError.BadEmailFormat]: HttpStatusCode.BadRequest,
    [ApiError.BadPasswordFormat]: HttpStatusCode.BadRequest,
    [ApiError.InvalidAuthorization]: HttpStatusCode.Unauthorized,
    [ApiError.InvalidUsername]: HttpStatusCode.Unauthorized,
    [ApiError.InvalidPassword]: HttpStatusCode.Unauthorized,
    [ApiError.InvalidCategoryName]: HttpStatusCode.BadRequest,
    [ApiError.InvalidPostTitle]: HttpStatusCode.BadRequest,

    [ApiError._Limitations]: null,
    [ApiError.NotStudentOrTeacher]: HttpStatusCode.BadRequest,
    [ApiError.UsernameUnavailable]: HttpStatusCode.Conflict,
    [ApiError.EmailTaken]: HttpStatusCode.Conflict,
    [ApiError.BadUsernameLength]: HttpStatusCode.BadRequest,
    [ApiError.BadPasswordLength]: HttpStatusCode.BadRequest,
    [ApiError.NewPasswordIsCurrent]: HttpStatusCode.Conflict,
    [ApiError.BadCategoryNameLength]: HttpStatusCode.BadRequest,
    [ApiError.BadCategoryDescriptionLength]: HttpStatusCode.BadRequest,
    [ApiError.BadPostTitleLength]: HttpStatusCode.BadRequest,
    [ApiError.BadMessageContentLength]: HttpStatusCode.BadRequest,

    [ApiError._Permissions]: null,
    [ApiError.NoPermission]: HttpStatusCode.Forbidden,
    [ApiError.CategoryLocked]: HttpStatusCode.Forbidden,
};

const apiErrorMessages: {
    [key in ApiError]: string | null;
} = {
    [ApiError.Generic]: null,

    [ApiError._Unknown]: null,
    [ApiError.UnknownUser]: 'Unknown user',
    [ApiError.UnknownCategory]: 'Unknown category',
    [ApiError.UnknownPost]: 'Unknown post',
    [ApiError.UnknownPostReply]: 'Unknown post reply',

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
    [ApiError.InvalidCategoryName]: 'Category names cannot contain newlines',
    [ApiError.InvalidPostTitle]: 'Post titles cannot contain newlines',

    [ApiError._Limitations]: null,
    [ApiError.NotStudentOrTeacher]: 'User must be a student or teacher',
    [ApiError.UsernameUnavailable]: 'Username unavailable',
    [ApiError.EmailTaken]: 'This email is taken',
    [ApiError.BadUsernameLength]: 'Username must be between 2-32 characters',
    [ApiError.BadPasswordLength]: 'Password must be between 6-128 characters',
    [ApiError.NewPasswordIsCurrent]:
        'New password cannot be the current password',
    [ApiError.BadCategoryNameLength]:
        'Category names must be between 1-72 characters',
    [ApiError.BadCategoryDescriptionLength]:
        'Category descriptions must be between 1-128 characters',
    [ApiError.BadPostTitleLength]:
        'Post titles must be between 1-72 characters',
    [ApiError.BadMessageContentLength]:
        'Message content must be between 1-2000 characters',

    [ApiError._Permissions]: null,
    [ApiError.NoPermission]: 'No permission',
    [ApiError.CategoryLocked]: 'Category locked',
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
): undefined {
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

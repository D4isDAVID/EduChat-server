import { ServerResponse } from 'node:http';
import { HttpStatusCode } from '../status.js';

export function writeEmptyReply(
    response: ServerResponse,
    status: HttpStatusCode = HttpStatusCode.NoContent,
) {
    response.statusCode = status;
    response.end();
}

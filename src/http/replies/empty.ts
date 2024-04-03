import { ServerResponse } from 'node:http';
import { HttpStatusCode } from '../status.js';

export function writeEmptyReply(
    response: ServerResponse,
    status: HttpStatusCode = HttpStatusCode.NoContent,
): undefined {
    response.statusCode = status;
    response.end();
}

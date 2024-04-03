import { ServerResponse } from 'node:http';
import { HttpStatusCode } from '../status.js';

export type JsonType =
    | string
    | number
    | boolean
    | null
    | {
          [x: string]: JsonType;
      }
    | JsonType[];

export function writeJsonReply(
    response: ServerResponse,
    obj: JsonType,
    status: HttpStatusCode = HttpStatusCode.OK,
): undefined {
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(obj));
    response.end();
}

import { IncomingMessage } from 'node:http';

export function getRequestUrl(request: IncomingMessage) {
    return new URL(request.url!, `http://${request.headers.host}`);
}

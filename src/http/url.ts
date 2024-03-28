import { IncomingMessage } from 'node:http';

export function getRequestUrl(request: IncomingMessage) {
    return new URL(request.url!.replaceAll(/\/+/g, '/').replace(/\/$/, ''), `http://${request.headers.host}`);
}

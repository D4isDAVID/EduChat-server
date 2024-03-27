import { IncomingMessage, ServerResponse } from 'node:http';

export type RouteHandlerProps = {
    request: IncomingMessage;
    response: ServerResponse;
    params: string[];
};

export type RouteHandler = (props: RouteHandlerProps) => any;

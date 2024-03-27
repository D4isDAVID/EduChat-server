import { once } from 'node:events';
import { RouteHandlerProps } from './index.js';

export const handleData = async ({
    request,
}: RouteHandlerProps): Promise<string> => {
    let data = '';

    request.on('data', (chunk) => {
        data += chunk;
    });

    await once(request, 'end');
    return data;
};

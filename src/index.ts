import { RequestListener, createServer } from 'node:http';
import { inspect } from 'node:util';
import { apiPort, prisma } from './env.js';
import { isSupportedMethod } from './http/methods.js';
import { writeEmptyReply } from './http/replies/empty.js';
import { writeStatusReply } from './http/replies/error.js';
import { loadRoutes } from './http/router.js';
import { HttpStatusCode } from './http/status.js';
import { getRequestUrl } from './http/url.js';

const router = await loadRoutes(new URL('./routes/', import.meta.url));
const listener: RequestListener = (request, response) => {
    if (!isSupportedMethod(request.method!)) {
        writeStatusReply(response, HttpStatusCode.NotImplemented);
        return;
    }

    const url = getRequestUrl(request);
    const route = router(url.pathname, request.method!);

    if (typeof route === 'number') {
        if (request.method! === 'HEAD') writeEmptyReply(response, route);
        else writeStatusReply(response, route);
        return;
    }

    route.handler({ request, response, params: route.params });
};

const server = createServer(listener);

server.on('close', () => {
    prisma.$disconnect();
});

server.listen(apiPort, () =>
    console.log(`Listening on ${inspect(server.address())}`),
);

import { RequestListener, createServer } from 'node:http';
import { inspect } from 'node:util';
import { apiPort, prisma } from './env.js';
import { isSupportedMethod } from './http/methods.js';
import { writeEmptyReply } from './http/replies/empty.js';
import { writeStatusReply } from './http/replies/error.js';
import { loadRoutes } from './http/router.js';
import { HttpStatusCode } from './http/status.js';
import { getRequestUrl } from './http/url.js';

const routesUrl = new URL('./routes/', import.meta.url);
const router = await loadRoutes(routesUrl);

const listener: RequestListener = async (request, response) => {
    if (!isSupportedMethod(request.method!)) {
        return writeStatusReply(response, HttpStatusCode.NotImplemented);
    }

    const url = getRequestUrl(request);
    const route = router(url.pathname, request.method!);

    if (typeof route === 'number') {
        if (request.method! === 'HEAD') writeEmptyReply(response, route);
        else writeStatusReply(response, route);
        return;
    }

    try {
        await route.handler({ request, response, params: route.params });
    } catch (e) {
        console.log(inspect(e));
        writeStatusReply(
            response,
            HttpStatusCode.InternalServerError,
            e instanceof Error ? e.message : undefined,
        );
    }
};

const server = createServer(listener);

server.on('close', () => {
    prisma.$disconnect();
});

server.listen(apiPort, () =>
    console.log(`Listening on ${inspect(server.address())}`),
);

import { readdir, stat } from 'node:fs/promises';
import { parse } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { RouteHandler } from './handlers/index.js';
import { SupportedMethod, isSupportedMethod } from './methods.js';
import { writeEmptyReply } from './replies/empty.js';
import { HttpStatusCode } from './status.js';

const paramPrefix = '_';

export type Router = (
    route: string,
    method: SupportedMethod,
    params?: string[],
) => { handler: RouteHandler; params: string[] } | HttpStatusCode;

export async function loadRoutes(dirUrl: URL): Promise<Router> {
    const dir = await stat(dirUrl);
    const dirPath = parse(fileURLToPath(dirUrl));

    if (!dir.isDirectory()) {
        throw new Error(`The path ${dirPath} is not a directory.`);
    }

    const methods: Map<SupportedMethod, RouteHandler> = new Map();
    const routers = new Map<string, Router>();
    let paramRouter: Router | null = null;

    const files = await readdir(dirUrl, {
        encoding: 'utf-8',
        withFileTypes: true,
    });

    await Promise.all(
        files.map(async (file) => {
            const fileUrl = new URL(`${file.name}${file.isDirectory() ? '/' : ''}`, dirUrl);
            const filePath = parse(fileURLToPath(fileUrl));

            if (file.isDirectory()) {
                const router = await loadRoutes(fileUrl);

                if (file.name.startsWith(paramPrefix)) {
                    if (paramRouter) {
                        throw new Error(
                            `Multiple param routes in path ${filePath.dir}.`,
                        );
                    }

                    paramRouter = router;
                    return;
                }

                routers.set(filePath.name, router);
                return;
            }

            if (
                !file.isFile() ||
                filePath.ext !== '.js' ||
                !isSupportedMethod(filePath.name)
            ) {
                return;
            }

            const handler = (await import(fileUrl.pathname)).default;
            if (typeof handler !== 'function') return;

            methods.set(filePath.name, handler);
        }),
    );

    if (!methods.has('HEAD') && methods.has('GET')) {
        methods.set('HEAD', (props) => methods.get('GET')!(props));
    }

    if (!methods.has('OPTIONS')) {
        methods.set('OPTIONS', ({ response }) => {
            response.setHeader('Allow', Array.from(methods.keys()).join(', '));
            writeEmptyReply(response);
        });
    }

    return (route: string, method: SupportedMethod, params: string[] = []) => {
        const splitRoute = route
            .replace(/^\//, '')
            .split('/', 3)
            .filter((s) => s !== '');

        if (splitRoute.length === 0) {
            if (!methods.has(method)) {
                return HttpStatusCode.MethodNotAllowed;
            }

            return { handler: methods.get(method)!, params };
        }

        const name = splitRoute.shift()!;
        const subRoute = splitRoute.join('/');

        if (routers.has(name)) {
            return routers.get(name)!(subRoute, method, params);
        }

        if (paramRouter) {
            return paramRouter(subRoute, method, [...params, name]);
        }

        return HttpStatusCode.NotFound;
    };
}

import { ApiError } from '../../../api/enums/error.js';
import { createUserObject } from '../../../api/objects/user.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const targetId = parseInt(rawId!);
    if (isNaN(targetId)) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const target = await prisma.user.findFirst({
        where: { id: targetId },
    });

    if (!target) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    writeJsonReply(response, await createUserObject(target));
}) satisfies RouteHandler;

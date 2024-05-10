import { ApiError } from '../../../../api/enums/error.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../http/replies/error.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    await prisma.user.delete({ where: { id: user.id } });

    return writeEmptyReply(response);
}) satisfies RouteHandler;

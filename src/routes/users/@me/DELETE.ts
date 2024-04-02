import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../http/replies/empty.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    await prisma.user.delete({ where: { id: user.id } });

    return writeEmptyReply(response);
}) satisfies RouteHandler;

import { ApiError } from '../../../api/enums/error.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../http/replies/empty.js';
import { writeErrorReply } from '../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const categoryId = parseInt(rawId!);
    if (isNaN(categoryId)) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    const category = await prisma.category.findFirst({
        where: { id: categoryId },
    });

    if (!category) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    await prisma.category.delete({ where: { id: categoryId } });

    writeEmptyReply(response);
}) satisfies RouteHandler;

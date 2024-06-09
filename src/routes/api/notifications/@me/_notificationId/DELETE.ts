import { ApiError } from '../../../../../api/enums/error.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawTimestamp],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const timestamp = parseInt(rawTimestamp!);
    if (isNaN(timestamp)) {
        return writeErrorReply(response, ApiError.UnknownNotification);
    }

    const date = new Date(timestamp);
    const notification = await prisma.notification.findFirst({
        where: { userId: user.id, createdAt: date },
    });

    if (!notification) {
        return writeErrorReply(response, ApiError.UnknownNotification);
    }

    await prisma.notification.delete({
        where: { id: notification.id },
    });

    return writeEmptyReply(response);
}) satisfies RouteHandler;

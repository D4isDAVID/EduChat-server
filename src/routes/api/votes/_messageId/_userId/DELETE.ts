import { ApiError } from '../../../../../api/enums/error.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, rawUserId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const messageId = parseInt(rawId!);
    if (isNaN(messageId)) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const userId = parseInt(rawUserId!);
    if (isNaN(userId)) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const message = await prisma.message.findFirst({
        where: { id: messageId },
    });

    if (!message) {
        return writeErrorReply(response, ApiError.UnknownMessage);
    }

    const target = await prisma.user.findFirst({
        where: { id: userId },
    });

    if (!target) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    await prisma.messageVote.delete({
        where: {
            messageId_userId: {
                messageId,
                userId,
            },
        },
    });

    writeEmptyReply(response);
}) satisfies RouteHandler;

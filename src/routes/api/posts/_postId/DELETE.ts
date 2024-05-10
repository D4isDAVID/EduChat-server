import { ApiError } from '../../../../api/enums/error.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const postId = parseInt(rawId!);
    if (isNaN(postId)) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const post = await prisma.post.findFirst({
        where: { messageId: postId },
        include: { message: true },
    });

    if (!post) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    if (!user.admin && user.id !== post.message.authorId) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    await prisma.post.delete({ where: { messageId: post.messageId } });

    writeEmptyReply(response);
}) satisfies RouteHandler;

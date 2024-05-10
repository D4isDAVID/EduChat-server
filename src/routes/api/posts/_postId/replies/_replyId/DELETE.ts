import { ApiError } from '../../../../../../api/enums/error.js';
import { prisma } from '../../../../../../env.js';
import { handleAuthorization } from '../../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../../http/handlers/index.js';
import { writeEmptyReply } from '../../../../../../http/replies/empty.js';
import { writeErrorReply } from '../../../../../../http/replies/error.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, rawReplyId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const postId = parseInt(rawId!);
    if (isNaN(postId)) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const replyId = parseInt(rawReplyId!);
    if (isNaN(replyId)) {
        return writeErrorReply(response, ApiError.UnknownPostReply);
    }

    const post = await prisma.post.findFirst({
        where: { messageId: postId },
    });

    if (!post) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const reply = await prisma.message.findFirst({
        where: { parentId: postId },
    });

    if (!reply) {
        return writeErrorReply(response, ApiError.UnknownPostReply);
    }

    if (!user.admin && reply.authorId !== user.id) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    await prisma.message.delete({ where: { id: reply.id } });

    writeEmptyReply(response);
}) satisfies RouteHandler;

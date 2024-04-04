import { ApiError } from '../../../../../api/enums/error.js';
import { createMessageObject } from '../../../../../api/objects/message.js';
import { prisma } from '../../../../../env.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, rawReplyId],
    } = props;

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

    writeJsonReply(response, await createMessageObject(reply));
}) satisfies RouteHandler;

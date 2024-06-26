import { ApiError } from '../../../../api/enums/error.js';
import { createPostObject } from '../../../../api/objects/post.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props, false);

    const postId = parseInt(rawId!);
    if (isNaN(postId)) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    const post = await prisma.post.findFirst({
        where: { messageId: postId },
    });

    if (!post) {
        return writeErrorReply(response, ApiError.UnknownPost);
    }

    if (user) {
        await prisma.notification.updateMany({
            where: { targetId: user.id, postId },
            data: { read: true },
        });
    }

    writeJsonReply(response, await createPostObject(post, user));
}) satisfies RouteHandler;

import { ApiError } from '../../../api/enums/error.js';
import { createPostObject } from '../../../api/objects/post.js';
import { prisma } from '../../../env.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

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

    writeJsonReply(response, await createPostObject(post));
}) satisfies RouteHandler;

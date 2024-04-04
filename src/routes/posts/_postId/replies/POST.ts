import { ApiError } from '../../../../api/enums/error.js';
import {
    isPostReplyCreateObject,
    toPostReplyCreateInput,
} from '../../../../api/input/post-reply-create.js';
import { createMessageObject } from '../../../../api/objects/message.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';
import { HttpStatusCode } from '../../../../http/status.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (!isPostReplyCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

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

    const createData = toPostReplyCreateInput(data, user, post);
    if (!handleInputConversion(props, createData)) return;

    const reply = await prisma.message.create({ data: createData });

    writeJsonReply(
        response,
        await createMessageObject(reply),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

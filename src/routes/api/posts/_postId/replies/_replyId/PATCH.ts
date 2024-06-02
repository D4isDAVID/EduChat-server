import { ApiError } from '../../../../../../api/enums/error.js';
import {
    isAdminPostReplyEditObject,
    toAdminPostReplyUpdateInput,
} from '../../../../../../api/input/post-reply-edit-admin.js';
import {
    isPostReplyEditObject,
    toPostReplyUpdateInput,
} from '../../../../../../api/input/post-reply-edit.js';
import { createMessageObject } from '../../../../../../api/objects/message.js';
import { prisma } from '../../../../../../env.js';
import { handleAuthorization } from '../../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId, rawReplyId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

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
        where: { id: replyId, parentId: postId },
    });

    if (!reply) {
        return writeErrorReply(response, ApiError.UnknownPostReply);
    }

    if (user.admin) {
        if (!isAdminPostReplyEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const updateData = toAdminPostReplyUpdateInput(data, reply);
        if (!handleInputConversion(props, updateData)) return;

        const updatedReply = await prisma.message.update({
            where: { id: reply.id },
            data: updateData,
        });

        return writeJsonReply(
            response,
            await createMessageObject(updatedReply, user),
        );
    }

    if (reply.authorId === user.id) {
        if (!isPostReplyEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const updateData = toPostReplyUpdateInput(data, reply);
        if (!handleInputConversion(props, updateData)) return;

        const updatedReply = await prisma.message.update({
            where: { id: reply.id },
            data: updateData,
        });

        return writeJsonReply(
            response,
            await createMessageObject(updatedReply, user),
        );
    }

    writeErrorReply(response, ApiError.NoPermission);
}) satisfies RouteHandler;

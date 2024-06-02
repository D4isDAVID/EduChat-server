import { Prisma } from '@prisma/client';
import { ApiError } from '../../../../api/enums/error.js';
import {
    isAdminPostEditObject,
    toAdminPostUpdateInput,
} from '../../../../api/input/post-edit-admin.js';
import {
    isPostEditObject,
    toPostUpdateInput,
} from '../../../../api/input/post-edit.js';
import { createPostObject } from '../../../../api/objects/post.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

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

    let updateData: Prisma.PostUpdateInput | null = null;

    if (user.admin) {
        if (!isAdminPostEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const newData = await toAdminPostUpdateInput(data, post);
        if (!handleInputConversion(props, newData)) return;

        updateData = newData;
    }

    if (!updateData && user.id === post.message.authorId) {
        if (!isPostEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const newData = await toPostUpdateInput(data, post);
        if (!handleInputConversion(props, newData)) return;

        updateData = newData;
    }

    if (!updateData) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const updatedPost = await prisma.post.update({
        where: { messageId: post.messageId },
        data: updateData,
    });

    return writeJsonReply(response, await createPostObject(updatedPost, user));
}) satisfies RouteHandler;

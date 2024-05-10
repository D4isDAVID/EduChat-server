import { ApiError } from '../../../../../api/enums/error.js';
import {
    isPostCreateObject,
    toPostCreateInput,
} from '../../../../../api/input/post-create.js';
import { createPostObject } from '../../../../../api/objects/post.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../http/replies/json.js';
import { HttpStatusCode } from '../../../../../http/status.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (!isPostCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const categoryId = parseInt(rawId!);
    if (isNaN(categoryId)) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    const category = await prisma.category.findFirst({
        where: { id: categoryId },
    });

    if (!category) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    if (category.locked) {
        return writeErrorReply(response, ApiError.CategoryLocked);
    }

    const createData = toPostCreateInput(data, user, category);
    if (!handleInputConversion(props, createData)) return;

    const post = await prisma.post.create({ data: createData });

    writeJsonReply(
        response,
        await createPostObject(post, user),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

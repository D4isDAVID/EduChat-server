import { ApiError } from '../../../../api/enums/error.js';
import { isPostCreateObject } from '../../../../api/input/post-create.js';
import { createPostObject } from '../../../../api/objects/post.js';
import { validatePostTitle } from '../../../../api/validators/post-title.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
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

    if (!isPostCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const categoryId = parseInt(rawId!);
    if (isNaN(categoryId)) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
        },
    });

    if (!category) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    const titleError = validatePostTitle(data.title);
    if (titleError) {
        return writeErrorReply(response, titleError);
    }

    const post = await prisma.post.create({
        data: {
            message: {
                create: {
                    authorId: user.id,
                    content: data.message.content,
                },
            },
            title: data.title,
            category: {
                connect: category,
            },
        },
    });

    writeJsonReply(
        response,
        await createPostObject(post),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

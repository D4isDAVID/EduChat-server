import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ApiError } from '../../../../../api/enums/error.js';
import { createPostsArray } from '../../../../../api/objects/post.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import {
    defaultValueParam,
    filterParam,
    handleSearchParams,
    intParam,
} from '../../../../../http/handlers/search-params.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props, false);

    const { limit, after, before } = handleSearchParams(props, {
        limit: defaultValueParam(
            filterParam(intParam, (x) => x >= 1 && x <= 100),
            100,
        ),
        after: intParam,
        before: intParam,
    });

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

    const findData: Prisma.PostFindManyArgs<DefaultArgs> = {
        where: { categoryId },
        orderBy: [
            { message: { pinned: 'desc' } },
            { message: { createdAt: 'desc' } },
        ],
        take: limit,
    };

    if (typeof after !== 'undefined' || typeof before !== 'undefined') {
        if (typeof after !== 'undefined') {
            findData.orderBy = { message: { createdAt: 'asc' } };
        }
        findData.cursor = { messageId: (after ?? before)! };
        findData.skip = 1;
    }

    const posts = await prisma.post.findMany(findData);

    writeJsonReply(response, await createPostsArray(posts, user));
}) satisfies RouteHandler;

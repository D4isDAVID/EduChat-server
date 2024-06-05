import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ApiError } from '../../../api/enums/error.js';
import { createPostsArray } from '../../../api/objects/post.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import {
    defaultValueParam,
    filterParam,
    handleSearchParams,
    intParam,
    stringParam,
} from '../../../http/handlers/search-params.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props, false);

    const { limit, after, title, categoryId } = handleSearchParams(props, {
        limit: defaultValueParam(
            filterParam(intParam, (x) => x >= 1 && x <= 100),
            100,
        ),
        after: intParam,
        title: stringParam,
        categoryId: intParam,
    });

    const findData: Prisma.PostFindManyArgs<DefaultArgs> = {
        orderBy: [
            { message: { pinned: 'desc' } },
            { message: { createdAt: 'desc' } },
        ],
        take: limit,
    };

    if (title) {
        if (!findData.where) findData.where = {};
        findData.where!.title = title;
    }

    if (typeof categoryId !== 'undefined') {
        const category = await prisma.category.findFirst({
            where: { id: categoryId },
        });

        if (!category) {
            return writeErrorReply(response, ApiError.UnknownCategory);
        }

        if (!findData.where) findData.where = {};
        findData.where!.categoryId = categoryId;
    }

    if (typeof after !== 'undefined') {
        findData.cursor = { messageId: after };
        findData.skip = 1;
    }

    const posts = await prisma.post.findMany(findData);

    writeJsonReply(response, await createPostsArray(posts, user));
}) satisfies RouteHandler;

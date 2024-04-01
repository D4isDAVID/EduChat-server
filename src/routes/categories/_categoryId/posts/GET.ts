import { ApiError } from '../../../../api/enums/error.js';
import { createPostsArray } from '../../../../api/objects/post.js';
import { prisma } from '../../../../env.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import {
    defaultValueParam,
    filterParam,
    handleSearchParams,
    intParam,
} from '../../../../http/handlers/search-params.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';
import { HttpStatusCode } from '../../../../http/status.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const { take, skip } = handleSearchParams(props, {
        take: defaultValueParam(
            filterParam(intParam, (x) => x >= 1 && x <= 100),
            100,
        ),
        skip: defaultValueParam(
            filterParam(intParam, (x) => x > 0),
            0,
        ),
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

    const posts = await prisma.post.findMany({
        where: { categoryId },
        take,
        skip,
    });

    writeJsonReply(
        response,
        await createPostsArray(posts),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

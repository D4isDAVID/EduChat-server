import { ApiError } from '../../../api/enums/error.js';
import { createCategoryObject } from '../../../api/objects/category.js';
import { prisma } from '../../../env.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

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

    writeJsonReply(response, await createCategoryObject(category));
}) satisfies RouteHandler;

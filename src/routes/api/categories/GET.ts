import { createCategoriesArray } from '../../../api/objects/category.js';
import { prisma } from '../../../env.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import {
    handleSearchParams,
    intParam,
} from '../../../http/handlers/search-params.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const { parentId } = handleSearchParams(props, {
        parentId: intParam,
    });

    const categories = await prisma.category.findMany({
        where: { parentId: parentId ?? null },
        orderBy: [{ pinned: 'desc' }, { name: 'asc' }],
    });

    writeJsonReply(response, await createCategoriesArray(categories));
}) satisfies RouteHandler;

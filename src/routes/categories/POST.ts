import { ApiError } from '../../api/enums/error.js';
import {
    isCategoryCreateObject,
    toCategoryCreateInput,
} from '../../api/input/category-create.js';
import { createCategoryObject } from '../../api/objects/category.js';
import { prisma } from '../../env.js';
import { handleAuthorization } from '../../http/handlers/authorization.js';
import { RouteHandler } from '../../http/handlers/index.js';
import { handleInputConversion } from '../../http/handlers/input-conversion.js';
import { handleJson } from '../../http/handlers/json.js';
import { writeErrorReply } from '../../http/replies/error.js';
import { writeJsonReply } from '../../http/replies/json.js';
import { HttpStatusCode } from '../../http/status.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const data = await handleJson(props);
    if (!data) return;

    if (!isCategoryCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const createData = toCategoryCreateInput(data);
    if (!handleInputConversion(props, createData)) return;

    const category = await prisma.category.create({ data: createData });

    writeJsonReply(
        response,
        await createCategoryObject(category),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

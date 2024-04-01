import { ApiError } from '../../../api/enums/error.js';
import {
    isCategoryEditObject,
    toCategoryUpdateInput,
} from '../../../api/input/category-edit.js';
import { createCategoryObject } from '../../../api/objects/category.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { handleInputConversion } from '../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../http/handlers/json.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    const data = await handleJson(props);
    if (!data) return;

    if (!isCategoryEditObject(data)) {
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

    const updateData = toCategoryUpdateInput(data, category);
    if (!handleInputConversion(props, updateData)) return;

    const updatedCategory = await prisma.category.update({
        where: { id: category.id },
        data: updateData,
    });

    writeJsonReply(response, await createCategoryObject(updatedCategory));
}) satisfies RouteHandler;

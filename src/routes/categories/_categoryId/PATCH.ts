import { Prisma } from '@prisma/client';
import { ApiError } from '../../../api/enums/error.js';
import { isCategoryEditObject } from '../../../api/input/category-edit.js';
import { createCategoryObject } from '../../../api/objects/category.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { handleJson } from '../../../http/handlers/json.js';
import { writeEmptyReply } from '../../../http/replies/empty.js';
import { writeErrorReply } from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';
import { HttpStatusCode } from '../../../http/status.js';

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
        where: {
            id: categoryId,
        },
    });

    if (!category) {
        return writeErrorReply(response, ApiError.UnknownCategory);
    }

    const updateData: Prisma.CategoryUpdateInput = {};
    if (data.name && data.name !== category.name) {
        updateData.name = data.name;
    }
    if ('description' in data && data.description !== category.description) {
        updateData.description = data.description;
    }
    if (data.pinned && data.pinned !== category.pinned) {
        updateData.pinned = data.pinned;
    }
    if (data.locked && data.locked !== category.locked) {
        updateData.locked = data.locked;
    }
    if (Object.keys(updateData).length === 0) {
        return writeEmptyReply(response, HttpStatusCode.NotModified);
    }

    const updatedCategory = await prisma.category.update({
        where: { id: category.id },
        data: updateData,
    });

    writeJsonReply(response, await createCategoryObject(updatedCategory));
}) satisfies RouteHandler;

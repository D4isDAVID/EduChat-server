import { Prisma } from '@prisma/client';
import { ApiError } from '../../../api/enums/error.js';
import { isUserAdminEditObject } from '../../../api/input/user-edit.js';
import { createUserObject } from '../../../api/objects/user.js';
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

    const data = await handleJson(props);
    if (!data) return;

    if (!user.admin) {
        return writeErrorReply(response, ApiError.NoPermission);
    }

    if (!isUserAdminEditObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const targetId = parseInt(rawId!);
    if (isNaN(targetId)) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const target = await prisma.user.findFirst({
        where: {
            id: targetId,
        },
    });

    if (!target) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (data.name && data.name !== target.name) {
        updateData.name = data.name;
    }
    if (Object.keys(updateData).length === 0) {
        return writeEmptyReply(response, HttpStatusCode.NotModified);
    }

    const updatedUser = await prisma.user.update({
        where: { id: target.id },
        data: updateData,
    });

    return writeJsonReply(response, await createUserObject(updatedUser));
}) satisfies RouteHandler;

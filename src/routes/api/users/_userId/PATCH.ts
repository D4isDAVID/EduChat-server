import { ApiError } from '../../../../api/enums/error.js';
import {
    isAdminUserEditObject,
    toAdminUserUpdateInput,
} from '../../../../api/input/user-edit-admin.js';
import { createUserObject } from '../../../../api/objects/user.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

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

    if (!isAdminUserEditObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const targetId = parseInt(rawId!);
    if (isNaN(targetId)) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const target = await prisma.user.findFirst({
        where: { id: targetId },
    });

    if (!target) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    const updateData = toAdminUserUpdateInput(data, user);
    if (!handleInputConversion(props, updateData)) return;

    const updatedUser = await prisma.user.update({
        where: { id: target.id },
        data: updateData,
    });

    return writeJsonReply(response, await createUserObject(updatedUser));
}) satisfies RouteHandler;

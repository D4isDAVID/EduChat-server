import { ApiError } from '../../../../api/enums/error.js';
import { NotificationType } from '../../../../api/enums/notification-type.js';
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

    const updateData = await toAdminUserUpdateInput(data, target);
    if (!handleInputConversion(props, updateData)) return;

    const updatedUser = await prisma.user.update({
        where: { id: target.id },
        data: updateData,
    });

    if (
        'admin' in updateData &&
        user.id !== target.id &&
        updateData.admin !== target.admin
    ) {
        await prisma.notification.create({
            data: {
                type: updateData.admin
                    ? NotificationType.AdminGranted
                    : NotificationType.AdminRevoked,
                target: { connect: { id: target.id } },
                user: { connect: { id: user.id } },
            },
        });
    }

    if (
        'helper' in updateData &&
        user.id !== target.id &&
        updateData.helper !== target.helper
    ) {
        await prisma.notification.create({
            data: {
                type: updateData.helper
                    ? NotificationType.HelperGranted
                    : NotificationType.HelperRevoked,
                target: { connect: { id: target.id } },
                user: { connect: { id: user.id } },
            },
        });
    }

    return writeJsonReply(response, await createUserObject(updatedUser));
}) satisfies RouteHandler;

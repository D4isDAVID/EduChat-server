import { ApiError } from '../../../../../api/enums/error.js';
import {
    isNotificationEditObject,
    toNotificationUpdateInput,
} from '../../../../../api/input/notification-edit.js';
import { createNotificationObject } from '../../../../../api/objects/notification.js';
import { prisma } from '../../../../../env.js';
import { handleAuthorization } from '../../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../../http/replies/json.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (!isNotificationEditObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const id = parseInt(rawId!);
    if (isNaN(id)) {
        return writeErrorReply(response, ApiError.UnknownNotification);
    }

    const notification = await prisma.notification.findFirst({
        where: { id, targetId: user.id },
    });

    if (!notification) {
        return writeErrorReply(response, ApiError.UnknownNotification);
    }

    let updateData = toNotificationUpdateInput(data);
    if (!handleInputConversion(props, updateData)) return;

    const updatedNotification = await prisma.notification.update({
        where: { id: notification.id },
        data: updateData,
    });

    return writeJsonReply(
        response,
        await createNotificationObject(updatedNotification, user),
    );
}) satisfies RouteHandler;

import { Prisma } from '@prisma/client';
import { createNotificationsArray } from '../../../../api/objects/notification.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import {
    booleanParam,
    defaultValueParam,
    handleSearchParams,
} from '../../../../http/handlers/search-params.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const { onlyNew, onlyUnread } = handleSearchParams(props, {
        onlyNew: defaultValueParam(booleanParam, false),
        onlyUnread: defaultValueParam(booleanParam, false),
    });

    const user = await handleAuthorization(props);
    if (!user) return;

    const findData: Prisma.NotificationFindManyArgs = {
        where: { targetId: user.id },
        orderBy: { createdAt: 'desc' },
    };

    if (onlyNew) {
        findData.where!.sent = false;
    }

    if (onlyUnread) {
        findData.where!.read = false;
    }

    const notifications = await prisma.notification.findMany(findData);

    await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { sent: true },
    });

    const objects = await createNotificationsArray(notifications, user);

    writeJsonReply(response, objects);
}) satisfies RouteHandler;

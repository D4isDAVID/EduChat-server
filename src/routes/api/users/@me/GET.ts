import { NotificationType } from '../../../../api/enums/notification-type.js';
import { createUserObject } from '../../../../api/objects/user.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    await prisma.notification.updateMany({
        where: {
            targetId: user.id,
            OR: [
                { type: NotificationType.HelperGranted },
                { type: NotificationType.HelperRevoked },
                { type: NotificationType.AdminGranted },
                { type: NotificationType.AdminRevoked },
            ],
        },
        data: { read: true },
    });

    return writeJsonReply(response, await createUserObject(user));
}) satisfies RouteHandler;

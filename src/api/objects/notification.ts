import { Notification, User } from '@prisma/client';
import { prisma } from '../../env.js';
import {
    NotificationType,
    messageNotifications,
    messageVoteNotifications,
    postNotifications,
    userNotifications,
} from '../enums/notification-type.js';
import { MessageObject, createMessageObject } from './message.js';
import { PostObject, createPostObject } from './post.js';
import { UserObject, createUserObject } from './user.js';

export type NotificationObject = {
    readonly id: number;
    readonly type: NotificationType;
    readonly createdAt: string;
    readonly read: boolean;

    readonly user?: UserObject;
    readonly post?: PostObject;
    readonly message?: MessageObject;
    readonly messageVote?: boolean;
};

export async function createNotificationObject(
    notification: Notification,
    target: User,
): Promise<NotificationObject | null> {
    const object: {
        readonly id: number;
        readonly type: NotificationType;
        readonly createdAt: string;
        readonly read: boolean;

        user?: UserObject;
        post?: PostObject;
        message?: MessageObject;
        messageVote?: boolean;
    } = {
        id: notification.id,
        type: notification.type,
        createdAt: notification.createdAt.toISOString(),
        read: notification.read,
    };

    const deleteThis = async () => {
        await prisma.notification.delete({ where: { id: notification.id } });
        return null;
    };

    if (userNotifications.includes(notification.type)) {
        if (!notification.userId) return deleteThis();

        const user = await prisma.user.findFirst({
            where: { id: notification.userId },
        });

        if (!user) return deleteThis();
        object.user = await createUserObject(user);
    }

    if (postNotifications.includes(notification.type)) {
        if (!notification.postId) return deleteThis();

        const post = await prisma.post.findFirst({
            where: { messageId: notification.postId! },
        });

        if (!post) return deleteThis();
        object.post = await createPostObject(post, target);
    }

    if (messageNotifications.includes(notification.type)) {
        if (!notification.messageId) return deleteThis();

        const message = await prisma.message.findFirst({
            where: { id: notification.messageId! },
        });

        if (!message) return deleteThis();
        object.message = await createMessageObject(message, target);
    }

    if (messageVoteNotifications.includes(notification.type)) {
        if (!notification.voteUserId || !notification.voteMessageId)
            return deleteThis();

        const messageVote = await prisma.messageVote.findFirst({
            where: {
                messageId: notification.voteMessageId,
                userId: notification.voteUserId,
            },
        });

        if (!messageVote) return deleteThis();
        object.messageVote = messageVote.positive;
    }

    return object;
}

export async function createNotificationsArray(
    notifications: Notification[],
    target: User,
): Promise<NotificationObject[]> {
    return (
        await Promise.all(
            notifications.map((n) => createNotificationObject(n, target)),
        )
    ).filter((r) => r !== null) as NotificationObject[];
}

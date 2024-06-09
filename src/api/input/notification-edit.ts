import { Prisma } from '@prisma/client';

export type NotificationEditObject = {
    readonly read?: boolean;
};

export function isNotificationEditObject(
    obj: unknown,
): obj is NotificationEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('read' in obj) || typeof obj.read === 'boolean')
    );
}

export function toNotificationUpdateInput(
    obj: NotificationEditObject,
): Prisma.NotificationUpdateInput | false {
    const data: Prisma.NotificationUpdateInput = {};

    if ('read' in obj) {
        data.read = obj.read;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

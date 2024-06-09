import { User } from '@prisma/client';
import { prisma } from '../../env.js';

const THIRTY_DAYS_MILLI = 1000 * 60 * 60 * 24 * 30;

export async function expireOldNotifications(user: User) {
    await prisma.notification.deleteMany({
        where: {
            userId: user.id,
            createdAt: { lte: new Date(Date.now() - THIRTY_DAYS_MILLI) },
        },
    });
}

import { Message, Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';

export type MessageVoteUpsertObject = {
    readonly positive: boolean;
};

export function isMessageVoteUpsertObject(
    obj: unknown,
): obj is MessageVoteUpsertObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'positive' in obj &&
        typeof obj.positive === 'boolean'
    );
}

export function toMessageVoteUpsertInput(
    obj: MessageVoteUpsertObject,
    message: Message,
    user: User,
): Prisma.MessageVoteUpsertArgs | ApiError {
    const data: Prisma.MessageVoteUpsertArgs = {
        create: {
            message: { connect: { id: message.id } },
            user: { connect: { id: user.id } },
            positive: obj.positive,
        },
        where: {
            messageId_userId: {
                messageId: message.id,
                userId: user.id,
            },
        },
        update: {
            positive: obj.positive,
        },
    };

    return data;
}

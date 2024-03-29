import { User } from '@prisma/client';
import { ApiError } from '../../api/enums/error.js';
import { prisma } from '../../env.js';
import { writeErrorReply, writeStatusReply } from '../replies/error.js';
import { HttpStatusCode } from '../status.js';
import { RouteHandlerProps } from './index.js';

export const handleAuthorization = async ({
    request,
    response,
}: RouteHandlerProps): Promise<User | void> => {
    const token = request.headers.authorization;
    if (!token) {
        return writeStatusReply(response, HttpStatusCode.Unauthorized);
    }

    const user = await prisma.user.findFirst({
        where: {
            token,
        },
    });

    if (!user) {
        return writeErrorReply(response, ApiError.InvalidToken);
    }

    return user;
};

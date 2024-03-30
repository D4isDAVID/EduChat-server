import { User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ApiError } from '../../api/enums/error.js';
import { prisma } from '../../env.js';
import { writeErrorReply, writeStatusReply } from '../replies/error.js';
import { HttpStatusCode } from '../status.js';
import { RouteHandlerProps } from './index.js';

export const handleAuthorization = async ({
    request,
    response,
}: RouteHandlerProps): Promise<User | void> => {
    const auth = request.headers.authorization;
    if (!auth) {
        return writeStatusReply(response, HttpStatusCode.Unauthorized);
    }

    const match = auth.match(
        /(?<scheme>[!#$%&'*+\-.^_`|~0-9A-Za-z]+)(?:[ \t]+(?<param>[A-Za-z0-9-._~+/]+))?/,
    );
    if (!match) {
        return writeErrorReply(response, ApiError.InvalidAuthorization);
    }

    if (match.groups!.scheme === 'Basic' && match.groups!.param) {
        const pair = Buffer.from(match.groups!.param!, 'base64').toString(
            'utf8',
        );

        const [name, password] = pair.split(':', 2);
        if (!name || !password) {
            return writeErrorReply(response, ApiError.InvalidAuthorization);
        }

        const user = await prisma.user.findFirst({
            where: {
                name,
            },
        });

        if (!user) {
            return writeErrorReply(response, ApiError.InvalidUsername);
        }

        if (!(await compare(password, user.passwordHash))) {
            return writeErrorReply(response, ApiError.InvalidPassword);
        }

        return user;
    }

    return writeErrorReply(response, ApiError.InvalidAuthorization);
};

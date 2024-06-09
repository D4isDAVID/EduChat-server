import { User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ApiError } from '../../api/enums/error.js';
import { expireOldNotifications } from '../../api/utils/expire-old-notifications.js';
import { prisma } from '../../env.js';
import { writeErrorReply, writeStatusReply } from '../replies/error.js';
import { HttpStatusCode } from '../status.js';
import { RouteHandlerProps } from './index.js';

export async function handleAuthorization(
    { request, response }: RouteHandlerProps,
    required: boolean = true,
): Promise<User | null> {
    const auth = request.headers.authorization;
    if (!auth) {
        if (required) writeStatusReply(response, HttpStatusCode.Unauthorized);
        return null;
    }

    const match = auth.match(
        /(?<scheme>[!#$%&'*+\-.^_`|~0-9A-Za-z]+)(?:[ \t]+(?<param>[A-Za-z0-9-._~+/]+))?/,
    );
    if (!match) {
        if (required) writeErrorReply(response, ApiError.InvalidAuthorization);
        return null;
    }

    if (match.groups!.scheme === 'Basic' && match.groups!.param) {
        const pair = Buffer.from(match.groups!.param!, 'base64').toString(
            'utf8',
        );

        const [email, password] = pair.split(':', 2);
        if (!email || !password) {
            if (required)
                writeErrorReply(response, ApiError.InvalidAuthorization);
            return null;
        }

        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            if (required) writeErrorReply(response, ApiError.InvalidEmail);
            return null;
        }

        if (!(await compare(password, user.passwordHash))) {
            if (required) writeErrorReply(response, ApiError.InvalidPassword);
            return null;
        }

        await expireOldNotifications(user);
        return user;
    }

    if (required) writeErrorReply(response, ApiError.InvalidAuthorization);
    return null;
}

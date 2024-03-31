import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { ApiError } from '../../../api/enums/error.js';
import {
    isAdminUserEditObject,
    isSelfUserEditObject,
} from '../../../api/input/user-edit.js';
import {
    createUserObject,
    meId,
    saltRounds,
} from '../../../api/objects/user.js';
import { prisma } from '../../../env.js';
import { handleAuthorization } from '../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../http/handlers/index.js';
import { handleJson } from '../../../http/handlers/json.js';
import { writeEmptyReply } from '../../../http/replies/empty.js';
import {
    writeErrorReply,
    writeStatusReply,
} from '../../../http/replies/error.js';
import { writeJsonReply } from '../../../http/replies/json.js';
import { HttpStatusCode } from '../../../http/status.js';

export default (async (props) => {
    const {
        response,
        params: [rawId],
    } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (rawId === meId) {
        if (!isSelfUserEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const updateData: Prisma.UserUpdateInput = {};
        if (data.name && data.name !== user.name) {
            updateData.name = data.name;
        }
        if (data.email && data.email !== user.email) {
            updateData.email = data.email;
        }
        if (data.password) {
            if (await compare(data.password, user.passwordHash)) {
                return writeErrorReply(response, ApiError.NewPasswordIsCurrent);
            }

            updateData.passwordHash = await hash(data.password, saltRounds);
        }
        if (Object.keys(updateData).length === 0) {
            return writeEmptyReply(response, HttpStatusCode.NotModified);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return writeJsonReply(response, await createUserObject(updatedUser));
    }

    if (user.admin) {
        if (!isAdminUserEditObject(data)) {
            return writeErrorReply(response, ApiError.InvalidObject);
        }

        const targetId = parseInt(rawId!);
        if (isNaN(targetId)) {
            return writeErrorReply(response, ApiError.UnknownUser);
        }

        const target = await prisma.user.findFirst({
            where: {
                id: targetId,
            },
        });

        if (!target) {
            return writeErrorReply(response, ApiError.UnknownUser);
        }

        const updateData: Prisma.UserUpdateInput = {};
        if (data.name && data.name !== target.name) {
            updateData.name = data.name;
        }
        if (Object.keys(updateData).length === 0) {
            return writeEmptyReply(response, HttpStatusCode.NotModified);
        }

        const updatedUser = await prisma.user.update({
            where: { id: target.id },
            data: updateData,
        });

        return writeJsonReply(response, await createUserObject(updatedUser));
    } else {
        return writeStatusReply(response, HttpStatusCode.Forbidden);
    }
}) satisfies RouteHandler;

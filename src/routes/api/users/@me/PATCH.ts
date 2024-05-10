import { ApiError } from '../../../../api/enums/error.js';
import {
    isUserEditObject,
    toUserUpdateInput,
} from '../../../../api/input/user-edit.js';
import { createUserObject } from '../../../../api/objects/user.js';
import { prisma } from '../../../../env.js';
import { handleAuthorization } from '../../../../http/handlers/authorization.js';
import { RouteHandler } from '../../../../http/handlers/index.js';
import { handleInputConversion } from '../../../../http/handlers/input-conversion.js';
import { handleJson } from '../../../../http/handlers/json.js';
import { writeErrorReply } from '../../../../http/replies/error.js';
import { writeJsonReply } from '../../../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const user = await handleAuthorization(props);
    if (!user) return;

    const data = await handleJson(props);
    if (!data) return;

    if (!isUserEditObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const updateData = await toUserUpdateInput(data, user);
    if (!handleInputConversion(props, updateData)) return;

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
    });

    return writeJsonReply(response, await createUserObject(updatedUser));
}) satisfies RouteHandler;

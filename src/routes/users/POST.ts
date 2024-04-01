import { ApiError } from '../../api/enums/error.js';
import {
    isUserCreateObject,
    toUserCreateInput,
} from '../../api/input/user-create.js';
import { createUserObject } from '../../api/objects/user.js';
import { prisma } from '../../env.js';
import { RouteHandler } from '../../http/handlers/index.js';
import { handleInputConversion } from '../../http/handlers/input-conversion.js';
import { handleJson } from '../../http/handlers/json.js';
import { writeErrorReply } from '../../http/replies/error.js';
import { writeJsonReply } from '../../http/replies/json.js';
import { HttpStatusCode } from '../../http/status.js';

export default (async (props) => {
    const { response } = props;

    const data = await handleJson(props);
    if (!data) return;

    if (!isUserCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const createData = await toUserCreateInput(data);
    if (!handleInputConversion(props, createData)) return;

    const user = await prisma.user.create({ data: createData });

    writeJsonReply(
        response,
        await createUserObject(user),
        HttpStatusCode.Created,
    );
}) satisfies RouteHandler;

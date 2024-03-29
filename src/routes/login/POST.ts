import { compare } from 'bcrypt';
import { ApiError } from '../../api/enums/error.js';
import { isUserLoginObject } from '../../api/input/user-login.js';
import { createUserObject } from '../../api/objects/user.js';
import { prisma } from '../../env.js';
import { RouteHandler } from '../../http/handlers/index.js';
import { handleJson } from '../../http/handlers/json.js';
import { writeErrorReply } from '../../http/replies/error.js';
import { writeJsonReply } from '../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const data = await handleJson(props);
    if (!data) return;

    if (!isUserLoginObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    name: data.name,
                },
                {
                    email: data.name,
                },
            ],
        },
    });

    if (!user) {
        return writeErrorReply(response, ApiError.UnknownUser);
    }

    if (!(await compare(data.password, user.passwordHash))) {
        return writeErrorReply(response, ApiError.InvalidPassword);
    }

    response.setHeader('Access-Control-Expose-Headers', 'authorization');
    response.setHeader('Authorization', user.token);
    writeJsonReply(response, await createUserObject(user));
}) satisfies RouteHandler;

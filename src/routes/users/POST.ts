import { ApiError } from '../../api/enums/error.js';
import {
    createPasswordHashAndToken,
    isUserCreateObject,
} from '../../api/input/user-create.js';
import { createUserObject } from '../../api/objects/user.js';
import { validateEmail } from '../../api/validators/email.js';
import { validatePassword } from '../../api/validators/password.js';
import { validateUsername } from '../../api/validators/username.js';
import { prisma } from '../../env.js';
import { RouteHandler } from '../../http/handlers/index.js';
import { handleJson } from '../../http/handlers/json.js';
import { writeErrorReply } from '../../http/replies/error.js';
import { writeJsonReply } from '../../http/replies/json.js';

export default (async (props) => {
    const { response } = props;

    const data = await handleJson(props);
    if (!data) return;

    if (!isUserCreateObject(data)) {
        return writeErrorReply(response, ApiError.InvalidObject);
    }

    const usernameError = validateUsername(data.name);
    if (usernameError) {
        return writeErrorReply(response, usernameError);
    }

    const emailError = validateEmail(data.email);
    if (emailError) {
        return writeErrorReply(response, emailError);
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) {
        return writeErrorReply(response, passwordError);
    }

    const takenUser = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    name: data.name,
                },
                {
                    email: data.email,
                },
            ],
        },
    });

    if (takenUser?.name === data.name) {
        return writeErrorReply(response, ApiError.UsernameUnavailable);
    }

    if (takenUser?.email === data.email) {
        return writeErrorReply(response, ApiError.EmailTaken);
    }

    const { token, passwordHash } = await createPasswordHashAndToken(
        data.password,
    );

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            token,
        },
    });

    response.setHeader('Access-Control-Expose-Headers', 'authorization');
    response.setHeader('Authorization', token);
    writeJsonReply(response, await createUserObject(user));
}) satisfies RouteHandler;

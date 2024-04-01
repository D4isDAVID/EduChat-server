import { Prisma, User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ApiError } from '../enums/error.js';
import { hashPassword } from '../utils/hash-password.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateEmail } from '../validators/email.js';
import { validatePassword } from '../validators/password.js';
import { validateUsername } from '../validators/username.js';

export type UserEditObject = {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
};

export function isUserEditObject(obj: unknown): obj is UserEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string') &&
        (!('email' in obj) || typeof obj.email === 'string') &&
        (!('password' in obj) || typeof obj.password === 'string')
    );
}

export async function toUserUpdateInput(
    obj: UserEditObject,
    user: User,
): Promise<Prisma.UserUpdateInput | ApiError | false> {
    const error = await checkUsernameAndEmailAvailability({
        name: obj.name,
        email: obj.email,
        user,
    });
    if (typeof error === 'number') {
        return error;
    }

    const data: Prisma.UserUpdateInput = {};

    if ('name' in obj && obj.name !== user.name) {
        const usernameError = validateUsername(obj.name);
        if (usernameError) {
            return usernameError;
        }

        data.name = obj.name;
    }

    if ('email' in obj && obj.email !== user.email) {
        const emailError = validateEmail(obj.email);
        if (emailError) {
            return emailError;
        }

        data.email = obj.email;
    }

    if ('password' in obj) {
        const passwordError = validatePassword(obj.password);
        if (passwordError) {
            return passwordError;
        }

        if (await compare(obj.password, user.passwordHash)) {
            return ApiError.NewPasswordIsCurrent;
        }

        data.passwordHash = await hashPassword(obj.password);
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

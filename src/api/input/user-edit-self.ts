import { Prisma, User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ApiError } from '../enums/error.js';
import { hashPassword } from '../utils/hash-password.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateEmail } from '../validators/email.js';
import { validatePassword } from '../validators/password.js';
import { validateUsername } from '../validators/username.js';

export type SelfUserEditObject = {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
};

export function isSelfUserEditObject(obj: unknown): obj is SelfUserEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string') &&
        (!('email' in obj) || typeof obj.email === 'string') &&
        (!('password' in obj) || typeof obj.password === 'string')
    );
}

export async function toSelfUserUpdateInput(
    obj: SelfUserEditObject,
    user: User,
): Promise<Prisma.UserUpdateInput | ApiError | false> {
    const data: Prisma.UserUpdateInput = {};

    const error = await checkUsernameAndEmailAvailability({
        name: obj.name,
        email: obj.email,
        user,
    });
    if (typeof error === 'number') return error;

    if ('name' in obj && obj.name !== user.name) {
        const usernameError = validateUsername(obj.name);
        if (usernameError) return usernameError;

        data.name = obj.name;
    }

    if ('email' in obj && obj.email !== user.email) {
        const emailError = validateEmail(obj.email);
        if (emailError) return emailError;

        data.email = obj.email;
    }

    if ('password' in obj) {
        const passwordError = validatePassword(obj.password);
        if (passwordError) return passwordError;

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

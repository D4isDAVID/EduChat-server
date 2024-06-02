import { Prisma, User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ApiError } from '../enums/error.js';
import { hashPassword } from '../utils/hash-password.js';
import { supersede } from '../utils/supersede-input.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateEmail } from '../validators/email.js';
import { validatePassword } from '../validators/password.js';
import {
    UserEditObject,
    isUserEditObject,
    toUserUpdateInput,
} from './user-edit.js';

export type SelfUserEditObject = UserEditObject & {
    readonly email?: string;
    readonly password?: string;
};

export function isSelfUserEditObject(obj: unknown): obj is UserEditObject {
    return (
        isUserEditObject(obj) &&
        (!('email' in obj) || typeof obj.email === 'string') &&
        (!('password' in obj) || typeof obj.password === 'string')
    );
}

export async function toSelfUserUpdateInput(
    obj: SelfUserEditObject,
    user: User,
): Promise<Prisma.UserUpdateInput | ApiError | false> {
    const data = supersede(await toUserUpdateInput(obj, user), {});
    if (typeof data !== 'object') return data;

    const error = await checkUsernameAndEmailAvailability({
        email: obj.email,
        user,
    });
    if (typeof error === 'number') return error;

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

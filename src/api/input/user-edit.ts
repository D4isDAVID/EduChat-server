import { Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateUsername } from '../validators/username.js';

export type UserEditObject = {
    readonly name?: string;
};

export function isUserEditObject(obj: unknown): obj is UserEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string')
    );
}

export async function toUserUpdateInput(
    obj: UserEditObject,
    user: User,
): Promise<Prisma.UserUpdateInput | ApiError | false> {
    const error = await checkUsernameAndEmailAvailability({
        name: obj.name,
        user,
    });
    if (typeof error === 'number') return error;

    const data: Prisma.UserUpdateInput = {};

    if ('name' in obj && obj.name !== user.name) {
        const usernameError = validateUsername(obj.name);
        if (usernameError) return usernameError;

        data.name = obj.name;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

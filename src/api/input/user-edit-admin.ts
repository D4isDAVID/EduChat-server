import { Prisma, User } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateUsername } from '../validators/username.js';

export type AdminUserEditObject = {
    readonly name?: string;
    readonly admin?: boolean;
    readonly helper?: boolean;
};

export function isAdminUserEditObject(
    obj: unknown,
): obj is AdminUserEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string') &&
        (!('admin' in obj) || typeof obj.admin === 'boolean') &&
        (!('helper' in obj) || typeof obj.helper === 'boolean')
    );
}

export async function toAdminUserUpdateInput(
    obj: AdminUserEditObject,
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

    if ('admin' in obj && obj.admin !== user.admin) {
        data.admin = obj.admin;
    }

    if ('helper' in obj && obj.helper !== user.helper) {
        data.helper = obj.helper;
    }

    if (Object.keys(data).length === 0) {
        return false;
    }

    return data;
}

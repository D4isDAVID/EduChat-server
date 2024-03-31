export type UserSelfEditObject = {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
};

export type UserAdminEditObject = {
    readonly name?: string;
};

export function isSelfUserEditObject(obj: unknown): obj is UserSelfEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string') &&
        (!('email' in obj) || typeof obj.email === 'string') &&
        (!('password' in obj) || typeof obj.password === 'string')
    );
}

export function isAdminUserEditObject(
    obj: unknown,
): obj is UserAdminEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string')
    );
}

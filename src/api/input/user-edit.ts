export type UserEditObject = {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
};

export type UserAdminEditObject = {
    readonly name?: string;
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

export function isUserAdminEditObject(
    obj: unknown,
): obj is UserAdminEditObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        (!('name' in obj) || typeof obj.name === 'string')
    );
}

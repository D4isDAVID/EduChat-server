export type UserLoginObject = {
    readonly name: string;
    readonly password: string;
};

export function isUserLoginObject(obj: unknown): obj is UserLoginObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        'password' in obj &&
        typeof obj.password === 'string'
    );
}

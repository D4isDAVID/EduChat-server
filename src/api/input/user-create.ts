export type UserCreateObject = {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly student?: boolean;
    readonly teacher?: boolean;
};

export function isUserCreateObject(obj: unknown): obj is UserCreateObject {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        'email' in obj &&
        typeof obj.email === 'string' &&
        'password' in obj &&
        typeof obj.password === 'string' &&
        (!('student' in obj) || typeof obj.student === 'boolean') &&
        (!('teacher' in obj) || typeof obj.teacher === 'boolean')
    );
}

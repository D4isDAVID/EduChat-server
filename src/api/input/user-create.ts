import { hash } from 'bcrypt';

export type UserCreateObject = {
    readonly name: string;
    readonly email: string;
    readonly password: string;
};

export function isUserCreateObject(obj: unknown): obj is UserCreateObject {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'name' in obj &&
        typeof obj.name === 'string' &&
        'email' in obj &&
        typeof obj.email === 'string' &&
        'password' in obj &&
        typeof obj.password === 'string'
    );
}

const hashSaltRounds = 10;

const randomHexStr = () =>
    Math.floor(Math.random() * (0xffffff - 0x111111 + 1) + 0x111111).toString(
        16,
    );

export async function createPasswordHashAndToken(password: string): Promise<{
    token: string;
    passwordHash: string;
}> {
    const token = `${Date.now().toString(16)}.${randomHexStr()}-${randomHexStr()}`;

    return {
        token,
        passwordHash: await hash(password, hashSaltRounds),
    };
}

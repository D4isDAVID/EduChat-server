import { User } from '@prisma/client';

export type UserObject = {
    readonly id: number;
    readonly name: string;
    readonly createdAt: Date;
    readonly flags: number;
};

export async function createUserObject(user: User): Promise<UserObject> {
    return {
        id: user.id,
        name: user.name,
        createdAt: new Date(user.createdAt),
        flags: user.flags,
    };
}

export function createUsersArray(users: User[]): Promise<UserObject[]> {
    return Promise.all(users.map(async (u) => await createUserObject(u)));
}

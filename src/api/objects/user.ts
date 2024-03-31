import { User } from '@prisma/client';

export const saltRounds = 10;
export const meId = '@me';

export type UserObject = {
    readonly id: number;
    readonly name: string;
    readonly createdAt: string;
    readonly admin: boolean;
    readonly student: boolean;
    readonly teacher: boolean;
};

export async function createUserObject(user: User): Promise<UserObject> {
    return {
        id: user.id,
        name: user.name,
        createdAt: new Date(user.createdAt).toISOString(),
        admin: user.admin,
        student: user.student,
        teacher: user.teacher,
    };
}

export function createUsersArray(users: User[]): Promise<UserObject[]> {
    return Promise.all(users.map(async (u) => await createUserObject(u)));
}

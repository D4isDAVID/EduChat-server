import { Prisma } from '@prisma/client';
import { ApiError } from '../enums/error.js';
import { hashPassword } from '../utils/hash-password.js';
import { checkUsernameAndEmailAvailability } from '../utils/username-email-availability.js';
import { validateEmail } from '../validators/email.js';
import { validatePassword } from '../validators/password.js';
import { validateUsername } from '../validators/username.js';

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

export async function toUserCreateInput(
    obj: UserCreateObject,
): Promise<Prisma.UserCreateInput | ApiError> {
    const error = await checkUsernameAndEmailAvailability({
        name: obj.name,
        email: obj.email,
    });
    if (typeof error === 'number') {
        return error;
    }

    const usernameError = validateUsername(obj.name);
    if (usernameError) {
        return usernameError;
    }

    const emailError = validateEmail(obj.email);
    if (emailError) {
        return emailError;
    }

    const passwordError = validatePassword(obj.password);
    if (passwordError) {
        return passwordError;
    }

    if (!obj.student && !obj.teacher) {
        return ApiError.NotStudentOrTeacher;
    }

    const data: Prisma.UserCreateInput = {
        name: obj.name,
        email: obj.email,
        passwordHash: await hashPassword(obj.password),
    };

    if ('student' in obj) {
        data.student = obj.student;
    }

    if ('teacher' in obj) {
        data.teacher = obj.teacher;
    }

    return data;
}

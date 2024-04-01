import { Prisma, User } from '@prisma/client';
import { prisma } from '../../env.js';
import { ApiError } from '../enums/error.js';

export async function checkUsernameAndEmailAvailability({
    name,
    email,
    user,
}: {
    name?: string | undefined;
    email?: string | undefined;
    user?: User | undefined;
}): Promise<ApiError | void> {
    if (!name && !email) {
        return;
    }

    const where: Prisma.UserWhereInput = {
        OR: [],
    };

    if (name) {
        where.OR!.push({ name });
    }

    if (email) {
        where.OR!.push({ email });
    }

    if (user) {
        where.NOT = { id: user.id };
    }

    const takenUser = await prisma.user.findFirst({ where });

    if (name && name === takenUser?.name) {
        return ApiError.UsernameUnavailable;
    }

    if (email && email === takenUser?.email) {
        return ApiError.EmailTaken;
    }
}

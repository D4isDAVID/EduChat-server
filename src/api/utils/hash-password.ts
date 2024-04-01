import { hash } from 'bcrypt';

const saltRounds = 10;

export async function hashPassword(password: string) {
    return hash(password, saltRounds);
}

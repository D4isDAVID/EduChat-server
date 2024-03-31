import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { prisma } from './env.js';

const readline = createInterface({
    input: stdin,
    output: stdout,
});

while (true) {
    const rawId = await readline.question(
        'Who would you like to give admin to? ',
    );

    const id = parseInt(rawId);
    if (isNaN(id) || !(await prisma.user.findFirst({ where: { id } }))) {
        console.log('Invalid user ID.');
        continue;
    }

    const { name } = await prisma.user.update({
        where: { id },
        data: { admin: true },
        select: { name: true },
    });

    console.log(`User ${name} is now an admin!`);
}

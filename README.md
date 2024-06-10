# EduChat-server

The server for my final project in computers class.
See [D4isDAVID/EduChat-app](https://github.com/D4isDAVID/EduChat-app).

Made in [TypeScript] with [Prisma] for DB creation
and [bcrypt] for password encoding.

## Running

1. Make a copy of `.env.example` and rename the copy to `.env`
2. Configure the `.env` file
3. Run `npm ci` to download the dependencies
4. Run `npx prisma db push` to initialize the database
5. Run `npm run build` to build the code
6. Run `npm run start` to start the server

[bcrypt]: https://npmjs.com/package/bcrypt
[prisma]: https://prisma.io
[typescript]: https://typescriptlang.org

import { PrismaClient } from '@prisma/client';
import { env } from 'node:process';

export const apiPort = env.API_PORT ? parseInt(env.API_PORT) : 8080;

export const prisma = new PrismaClient();

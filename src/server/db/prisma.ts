import { PrismaClient } from './generated/db';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const db: PrismaClient = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;

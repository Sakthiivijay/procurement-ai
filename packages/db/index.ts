import { PrismaClient } from '@prisma/client'

// ADD THIS LINE HERE
declare const process: any;

// This ensures we don't create multiple database connections during development hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma



import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This ensures that the same instance is used across the application.
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma client.
// If a global instance doesn't exist, create a new one.
// In development, this prevents creating a new client on every hot reload.
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

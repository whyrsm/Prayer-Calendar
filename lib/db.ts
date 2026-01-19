import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create connection pool for PostgreSQL
const connectionString = process.env.DATABASE_URL!

let prismaInstance: PrismaClient

if (connectionString.startsWith('postgresql://') || connectionString.startsWith('postgres://')) {
  // Use adapter for PostgreSQL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
} else {
  // Fallback for other database types (like Prisma Postgres)
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma || prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

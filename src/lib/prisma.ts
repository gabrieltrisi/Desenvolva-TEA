import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { DatabaseUnavailableError } from "@/lib/database-error";
import { isDatabaseConnectionError } from "@/lib/database-health";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      // Interceptação global: qualquer operação que falhe por indisponibilidade
      // do banco é convertida em DatabaseUnavailableError (com digest estável),
      // evitando que o stack trace cru do Prisma chegue ao usuário.
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (isDatabaseConnectionError(error)) {
            throw new DatabaseUnavailableError({ cause: error });
          }
          throw error;
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

// Singleton para evitar múltiplas conexões durante o hot-reload do Next.js.
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

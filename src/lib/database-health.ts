import "server-only";
import { Prisma } from "@/generated/prisma/client";
import {
  DatabaseUnavailableError,
  DATABASE_ERROR_DIGEST,
} from "@/lib/database-error";

export { DatabaseUnavailableError, DATABASE_ERROR_DIGEST };

// Códigos do Prisma que indicam falha de conectividade (não erro de domínio).
//  P1001 — Can't reach database server
//  P1002 — Database server timed out
//  P1017 — Server has closed the connection
const CONNECTION_ERROR_CODES = new Set(["P1001", "P1002", "P1017"]);

// Padrões emitidos pelo driver adapter (pg) quando o servidor está fora do ar.
const CONNECTION_ERROR_PATTERN =
  /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|Connection terminated|connection refused|Can't reach database|P1001|P1002|P1017/i;

/**
 * Distingue uma falha de **infraestrutura** (banco inacessível) de um erro de
 * domínio/consulta. Usado pelo interceptor global do Prisma para normalizar
 * apenas falhas de conexão.
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof DatabaseUnavailableError) return true;
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    CONNECTION_ERROR_CODES.has(error.code)
  ) {
    return true;
  }
  // Erros do adapter pg chegam como Error comum; inspeciona message + code.
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message = error instanceof Error ? error.message : String(error);
  return CONNECTION_ERROR_PATTERN.test(`${message} ${code}`);
}

export type DatabaseCheck =
  | { ok: true }
  | { ok: false; reason: "database_unreachable" };

/**
 * Verifica a conexão com o banco executando um `SELECT 1`. Nunca lança —
 * retorna um resultado estruturado para o health check e o startup.
 */
export async function checkDatabaseConnection(): Promise<DatabaseCheck> {
  try {
    // Import dinâmico evita ciclo (prisma.ts importa este módulo).
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch {
    return { ok: false, reason: "database_unreachable" };
  }
}

/** Atalho booleano sobre {@link checkDatabaseConnection}. */
export async function isDatabaseAvailable(): Promise<boolean> {
  return (await checkDatabaseConnection()).ok;
}

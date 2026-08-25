/**
 * Tipos client-safe para sinalizar indisponibilidade do banco.
 *
 * Este módulo NÃO importa "server-only" nem o Prisma de propósito: ele é
 * compartilhado entre o servidor (onde o erro é lançado) e os error boundaries
 * (Client Components), que só precisam comparar o digest.
 */

/**
 * Digest estável anexado ao erro de indisponibilidade do banco.
 *
 * O Next.js preserva um `digest` previamente definido no erro e o repassa ao
 * error boundary no cliente (ver create-error-handler: "respect the original
 * digest"). Isso permite exibir uma tela amigável mesmo em produção, onde a
 * `message` original do erro é ocultada.
 */
export const DATABASE_ERROR_DIGEST = "DATABASE_UNAVAILABLE";

/**
 * Erro normalizado para falhas de infraestrutura do banco (servidor fora do ar,
 * conexão recusada, P1001...). Substitui o `PrismaClientKnownRequestError` cru,
 * evitando vazar stack trace do Prisma para a interface.
 */
export class DatabaseUnavailableError extends Error {
  /** Repassado pelo Next.js ao error boundary cliente. */
  readonly digest = DATABASE_ERROR_DIGEST;

  constructor(options?: { cause?: unknown }) {
    super("Banco de dados temporariamente indisponível.", options);
    this.name = "DatabaseUnavailableError";
  }
}

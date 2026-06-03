/**
 * Executado uma única vez no boot do servidor. Valida configuração cedo
 * (falha rápida em env inválida) e checa a conexão com o banco — sem derrubar
 * o servidor se o banco estiver fora do ar, para que a tela amigável funcione.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { validateEnv } = await import("@/lib/env");
  validateEnv(); // DATABASE_URL, AUTH_SECRET... (lança se inválido)

  await validateDatabaseConnection();
}

/** Ping de conexão no boot, com timeout, apenas para log de diagnóstico. */
async function validateDatabaseConnection() {
  const { checkDatabaseConnection } = await import("@/lib/database-health");

  const TIMEOUT_MS = 5000;
  const timeout = new Promise<{ ok: false; reason: "timeout" }>((resolve) =>
    setTimeout(() => resolve({ ok: false, reason: "timeout" }), TIMEOUT_MS),
  );

  const result = await Promise.race([checkDatabaseConnection(), timeout]);

  if (result.ok) {
    console.log("✓ Database connected");
  } else {
    console.warn(
      "✗ Database unavailable — verifique se o serviço de banco está ativo (npm run db:up).",
    );
  }
}

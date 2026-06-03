import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const minSecret = isProd ? 32 : 16;

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL é obrigatória.")
    .refine((v) => /^postgres(ql)?:\/\//.test(v), {
      message: "DATABASE_URL deve ser uma string de conexão PostgreSQL.",
    }),
  AUTH_SECRET: z
    .string()
    .min(
      minSecret,
      `AUTH_SECRET deve ter no mínimo ${minSecret} caracteres. Gere com: openssl rand -base64 32`,
    ),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .refine((v) => v === "" || /^https?:\/\//.test(v), {
      message: "NEXT_PUBLIC_SITE_URL deve ser uma URL http(s) válida.",
    })
    .optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/**
 * Valida as variáveis de ambiente. Lança um erro descritivo (falha rápida) se
 * alguma estiver ausente ou inválida. Chamado no boot via instrumentation.ts.
 */
export function validateEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".") || "(raiz)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Variáveis de ambiente inválidas:\n${issues}\n\n` +
        "Verifique seu arquivo .env (use .env.example como referência).",
    );
  }
  cached = parsed.data;
  return cached;
}

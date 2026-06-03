"use client";

import { Database, RotateCcw } from "lucide-react";
import { Logo } from "@/components/ui/logo";

/**
 * Tela amigável exibida quando o banco de dados está indisponível.
 * Substitui o stack trace cru do Prisma por uma mensagem orientadora.
 */
export function DatabaseUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-warm-50 via-white to-brand-50 px-4 text-center">
      <Logo size="lg" className="mb-10" />

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-warm-500">
        <Database className="h-8 w-8" />
      </span>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
        Banco de dados temporariamente indisponível
      </h1>
      <p className="mt-2 max-w-md text-slate-500">
        Verifique se o serviço de banco está ativo.
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <RotateCcw className="h-5 w-5" /> Tentar novamente
        </button>
      )}
    </main>
  );
}

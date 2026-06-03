"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { DATABASE_ERROR_DIGEST } from "@/lib/database-error";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDatabaseDown = error.digest === DATABASE_ERROR_DIGEST;

  // global-error substitui o layout raiz: precisa de <html> e <body> próprios.
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <title>
          {isDatabaseDown
            ? "Banco indisponível · Desenvolva TEA"
            : "Erro inesperado · Desenvolva TEA"}
        </title>
        {isDatabaseDown ? (
          <DatabaseUnavailable onRetry={unstable_retry} />
        ) : (
        <main className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
            <span className="text-lg font-extrabold">D</span>
          </span>

          <span className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-warm-500">
            <AlertTriangle className="h-8 w-8" />
          </span>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
            Erro inesperado
          </h1>
          <p className="mt-2 max-w-md text-slate-500">
            Não foi possível carregar a aplicação. Tente novamente em alguns
            instantes.
          </p>

          {error.digest && (
            <p className="mt-3 rounded-lg bg-white px-3 py-1.5 font-mono text-xs text-slate-400">
              Código do erro: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <RotateCcw className="h-5 w-5" /> Tentar novamente
          </button>
        </main>
        )}
      </body>
    </html>
  );
}

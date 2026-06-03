"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { DATABASE_ERROR_DIGEST } from "@/lib/database-error";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Em produção, envie para um serviço de monitoramento de erros.
    console.error(error);
  }, [error]);

  // Falha de infraestrutura do banco → tela amigável (sem stack trace).
  if (error.digest === DATABASE_ERROR_DIGEST) {
    return <DatabaseUnavailable onRetry={unstable_retry} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-warm-50 via-white to-brand-50 px-4 text-center">
      <Logo size="lg" className="mb-10" />

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-100 text-warm-500">
        <AlertTriangle className="h-8 w-8" />
      </span>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
        Algo deu errado
      </h1>
      <p className="mt-2 max-w-md text-slate-500">
        Encontramos um problema inesperado ao carregar esta página. Você pode
        tentar novamente ou voltar ao início.
      </p>

      {error.digest && (
        <p className="mt-3 rounded-lg bg-surface-muted px-3 py-1.5 font-mono text-xs text-slate-400">
          Código do erro: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <RotateCcw className="h-5 w-5" /> Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-surface-muted"
        >
          <Home className="h-5 w-5" /> Ir para o início
        </Link>
      </div>
    </main>
  );
}

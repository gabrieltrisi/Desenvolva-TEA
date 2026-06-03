import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cabeçalho padrão dos documentos legais. */
export function LegalHeader({
  title,
  updatedAt,
}: {
  title: string;
  updatedAt: string;
}) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <p className="text-sm font-bold uppercase tracking-wide text-brand-600">
        Documento legal
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Última atualização: {updatedAt}
      </p>
    </header>
  );
}

/** Aviso destacado (ex.: recomendação de revisão jurídica). */
export function LegalNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex gap-3 rounded-2xl border border-trust-200 bg-trust-50 p-4 text-sm text-trust-900">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-trust-500" />
      <div>{children}</div>
    </div>
  );
}

/**
 * Wrapper tipográfico para conteúdo legal. Aplica estilos consistentes a
 * h2/h3/p/ul/li/a/strong sem depender do plugin de typography.
 */
export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "text-[15px] leading-relaxed text-slate-700",
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-6 [&_h3]:font-bold [&_h3]:text-foreground",
        "[&_p]:mt-3",
        "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_li]:marker:text-brand-400",
        "[&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

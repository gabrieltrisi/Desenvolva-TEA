import { cn } from "@/lib/utils";

/** Bloco de carregamento (shimmer) reutilizável. Decorativo: oculto a leitores. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
    />
  );
}

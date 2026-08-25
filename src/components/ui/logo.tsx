import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK: Record<Size, string> = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
};

const ICON: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const TEXT: Record<Size, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

/** Símbolo da marca (coração) — sem o texto. Útil em espaços compactos. */
export function LogoMark({
  size = "md",
  inverted = false,
  className,
}: {
  size?: Size;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm",
        MARK[size],
        inverted ? "bg-white/15 text-white" : "bg-brand-500 text-white",
        className,
      )}
    >
      <HeartHandshake className={ICON[size]} />
    </span>
  );
}

/**
 * Logotipo Desenvolva TEA. Componente puramente visual — quem usa decide se
 * envolve em <Link>. Use `inverted` sobre fundos escuros (ex.: hero brand).
 */
export function Logo({
  size = "md",
  wordmark = true,
  inverted = false,
  className,
}: {
  size?: Size;
  wordmark?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} inverted={inverted} />
      {wordmark && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            TEXT[size],
            inverted ? "text-white" : "text-foreground",
          )}
        >
          Desenvolva
          <span className={inverted ? "text-brand-100" : "text-brand-500"}>
            TEA
          </span>
        </span>
      )}
    </span>
  );
}

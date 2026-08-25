import { cn } from "@/lib/utils";

type Tone = "brand" | "trust" | "warm" | "neutral" | "success";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700",
  trust: "bg-trust-100 text-trust-700",
  warm: "bg-warm-100 text-warm-500",
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-100 text-emerald-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

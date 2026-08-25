import { cn } from "@/lib/utils";

/** Seletor segmentado de 1 a 5 (radios nativos → vão no FormData). */
export function RatingField({
  name,
  label,
  defaultValue,
  error,
  lowLabel = "Baixo",
  highLabel = "Alto",
}: {
  name: string;
  label: string;
  defaultValue?: number;
  error?: string;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className="mt-1.5 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <label key={v} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={v}
              defaultChecked={defaultValue === v}
              className="peer sr-only"
              required
            />
            <span
              className={cn(
                "flex h-11 items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold text-slate-500 transition-colors hover:bg-surface-muted",
                "peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-trust-500",
              )}
            >
              {v}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </fieldset>
  );
}

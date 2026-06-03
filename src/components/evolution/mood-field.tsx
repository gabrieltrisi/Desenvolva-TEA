import { cn } from "@/lib/utils";
import { MOOD_SCALE } from "@/lib/labels";

/** Seletor de humor (1–5) com emoji. */
export function MoodField({
  name = "mood",
  label = "Humor da criança",
  defaultValue,
  error,
}: {
  name?: string;
  label?: string;
  defaultValue?: number;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className="mt-1.5 grid grid-cols-5 gap-2">
        {MOOD_SCALE.map((m) => (
          <label key={m.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={m.value}
              defaultChecked={defaultValue === m.value}
              className="peer sr-only"
              required
            />
            <span
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border border-border bg-surface py-2 transition-colors hover:bg-surface-muted",
                "peer-checked:border-brand-500 peer-checked:bg-brand-50",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-trust-500",
              )}
              title={m.label}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className="text-[10px] font-medium text-slate-500">
                {m.label}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </fieldset>
  );
}

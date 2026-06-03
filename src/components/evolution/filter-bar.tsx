"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type RangeKey = "week" | "month" | "custom";

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
];

export function FilterBar({
  range,
  from,
  to,
}: {
  range: RangeKey;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParams(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex rounded-xl border border-border p-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setParams({ range: p.key, from: null, to: null })}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              range === p.key
                ? "bg-brand-50 text-brand-700"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setParams({ range: "custom" })}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            range === "custom"
              ? "bg-brand-50 text-brand-700"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Personalizado
        </button>
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-slate-500">
            De
            <input
              type="date"
              defaultValue={from}
              onChange={(e) => setParams({ range: "custom", from: e.target.value })}
              className="mt-1 block h-9 rounded-lg border border-border bg-surface px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Até
            <input
              type="date"
              defaultValue={to}
              onChange={(e) => setParams({ range: "custom", to: e.target.value })}
              className="mt-1 block h-9 rounded-lg border border-border bg-surface px-3 text-sm"
            />
          </label>
        </div>
      )}
    </div>
  );
}

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MunicipioComparison } from "@/lib/municipio/data";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE = {
  up: "bg-emerald-50 text-emerald-600",
  down: "bg-red-50 text-red-500",
  flat: "bg-slate-100 text-slate-500",
} as const;

const ICON = { up: ArrowUp, down: ArrowDown, flat: Minus };
const WORD = { up: "aumento", down: "queda", flat: "estável" };

export function ComparisonBlock({ data }: { data: MunicipioComparison }) {
  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <CardTitle>Comparativo do Período</CardTitle>
        <span className="text-xs text-slate-500">
          {data.currentLabel} vs. período anterior equivalente
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {data.metrics.map((m) => {
          const Icon = ICON[m.direction];
          return (
            <div key={m.key} className="rounded-xl border border-border p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {m.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">
                {m.current}
                {m.suffix}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold",
                    TONE[m.direction],
                  )}
                  title={WORD[m.direction]}
                >
                  <Icon className="h-3 w-3" />
                  {m.delta > 0 ? "+" : ""}
                  {m.delta}
                  {m.suffix}
                  {m.pct != null ? ` (${m.pct > 0 ? "+" : ""}${m.pct}%)` : ""}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                anterior: {m.previous}
                {m.suffix}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

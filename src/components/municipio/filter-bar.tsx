"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const FIELD =
  "h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:border-trust-400";

export function MunicipioFilterBar({
  period,
  level,
  status,
  from,
  to,
}: {
  period: string;
  level: string;
  status: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-xs font-semibold text-slate-500">
        Período
        <select
          className={`mt-1 block ${FIELD}`}
          value={period}
          onChange={(e) => setParam({ period: e.target.value, from: null, to: null })}
        >
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Últimos 12 meses</option>
          <option value="custom">Personalizado</option>
        </select>
      </label>

      {period === "custom" && (
        <>
          <label className="text-xs font-semibold text-slate-500">
            De
            <input
              type="date"
              defaultValue={from}
              className={`mt-1 block ${FIELD}`}
              onChange={(e) => setParam({ period: "custom", from: e.target.value })}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Até
            <input
              type="date"
              defaultValue={to}
              className={`mt-1 block ${FIELD}`}
              onChange={(e) => setParam({ period: "custom", to: e.target.value })}
            />
          </label>
        </>
      )}

      <label className="text-xs font-semibold text-slate-500">
        Nível TEA
        <select
          className={`mt-1 block ${FIELD}`}
          value={level}
          onChange={(e) => setParam({ level: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="1">Nível 1</option>
          <option value="2">Nível 2</option>
          <option value="3">Nível 3</option>
          <option value="none">Não informado</option>
        </select>
      </label>

      <label className="text-xs font-semibold text-slate-500">
        Status
        <select
          className={`mt-1 block ${FIELD}`}
          value={status}
          onChange={(e) => setParam({ status: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </label>
    </div>
  );
}

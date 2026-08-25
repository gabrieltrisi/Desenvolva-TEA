import { getSession } from "@/lib/auth/session";
import { canViewMunicipio } from "@/lib/auth/rbac";
import { resolveAccessUser } from "@/lib/access/children";
import {
  getMunicipioData,
  parseMunicipioFilters,
} from "@/lib/municipio/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escapa um campo CSV (delimitador ';' para Excel pt-BR). */
function cell(value: string | number): string {
  const s = String(value);
  if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Não autenticado", { status: 401 });
  if (!canViewMunicipio(session.role))
    return new Response("Acesso negado", { status: 403 });

  const sp = new URL(req.url).searchParams;
  const filters = parseMunicipioFilters({
    period: sp.get("period") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    level: sp.get("level") ?? undefined,
    status: sp.get("status") ?? undefined,
  });

  const user = await resolveAccessUser(session);
  const data = await getMunicipioData(user, filters);

  const headers = [
    "Nome",
    "Idade",
    "Nível TEA",
    "Responsável",
    "Terapeuta",
    "Evolução geral (%)",
    "Último registro",
    "Status",
    "Total de registros",
    "Conteúdos consumidos",
  ];

  const lines = [
    headers.map(cell).join(";"),
    ...data.rows.map((r) =>
      [
        r.name,
        r.age,
        r.teaLevel,
        r.guardian,
        r.therapist,
        r.evolution,
        r.lastRecord ?? "—",
        r.active ? "Ativo" : "Inativo",
        r.recordCount,
        r.contentCount,
      ]
        .map(cell)
        .join(";"),
    ),
  ];

  // BOM (﻿) garante acentuação correta ao abrir no Excel.
  const csv = "﻿" + lines.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="acompanhamento-municipal-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

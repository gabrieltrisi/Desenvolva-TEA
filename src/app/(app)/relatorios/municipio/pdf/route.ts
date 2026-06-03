import { getSession } from "@/lib/auth/session";
import { canViewMunicipio } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import {
  getMunicipioData,
  getMunicipioComparison,
  parseMunicipioFilters,
} from "@/lib/municipio/data";
import { renderMunicipioReportPdf } from "@/lib/reports/municipio-report-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const [data, comparison] = await Promise.all([
    getMunicipioData(session, filters),
    getMunicipioComparison(session, filters),
  ]);
  const pdf = await renderMunicipioReportPdf(data, comparison);

  // Registra a emissão (alimenta o card "Relatórios emitidos").
  await prisma.reportEmission.create({
    data: { organizationId: session.organizationId, kind: "MUNICIPAL" },
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-municipal.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

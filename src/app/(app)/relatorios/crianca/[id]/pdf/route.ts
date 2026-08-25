import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getChildReportData, parseReportWindow } from "@/lib/reports/data";
import { renderChildReportPdf } from "@/lib/reports/child-report-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Não autenticado", { status: 401 });

  const { id } = await params;
  const sp = new URL(req.url).searchParams;
  const win = parseReportWindow({
    range: sp.get("range") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });

  const data = await getChildReportData(session, id, win);
  if (!data) return new Response("Relatório não encontrado", { status: 404 });

  const pdf = await renderChildReportPdf(data);

  // Registra a emissão (alimenta o card municipal "Relatórios emitidos").
  await prisma.reportEmission.create({
    data: { organizationId: session.organizationId, kind: "CHILD" },
  });

  const filename = `relatorio-${slug(data.child.name)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

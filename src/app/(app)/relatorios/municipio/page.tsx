import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { canViewMunicipio } from "@/lib/auth/rbac";
import {
  getMunicipioData,
  getMunicipioComparison,
  parseMunicipioFilters,
} from "@/lib/municipio/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparisonBlock } from "@/components/municipio/comparison-block";
import {
  MuniLineChart,
  MuniBarChart,
  MuniPieChart,
} from "@/components/municipio/charts";

export const metadata: Metadata = { title: "Relatório Municipal" };

export default async function RelatorioMunicipioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canViewMunicipio(session.role)) redirect("/dashboard");

  const sp = await searchParams;
  const filters = parseMunicipioFilters(sp);
  const [data, comparison] = await Promise.all([
    getMunicipioData(session, filters),
    getMunicipioComparison(session, filters),
  ]);
  const { cards, charts, rows } = data;
  const activeCount = rows.filter((r) => r.active).length;

  const qs = new URLSearchParams();
  qs.set("period", filters.period);
  if (filters.period === "custom") {
    if (filters.from) qs.set("from", filters.from);
    if (filters.to) qs.set("to", filters.to);
  }
  if (filters.level !== "all") qs.set("level", filters.level);
  if (filters.status !== "all") qs.set("status", filters.status);
  const pdfHref = `/relatorios/municipio/pdf?${qs.toString()}`;

  const kpis = [
    { v: cards.totalChildren, l: "Crianças cadastradas" },
    { v: cards.activeFamilies, l: "Famílias ativas" },
    { v: cards.professionals, l: "Profissionais" },
    { v: cards.evolutionRecords, l: "Registros de evolução" },
    { v: cards.contentsConsumed, l: "Conteúdos consumidos" },
    { v: `${cards.avgEvolution}%`, l: "Evolução média" },
    { v: cards.reportsEmitted, l: "Relatórios emitidos" },
    { v: activeCount, l: "Crianças ativas" },
  ];

  return (
    <>
      <PageHeader
        title="Relatório Municipal Consolidado"
        description="Pré-visualização. Baixe o PDF para apresentação institucional."
        action={
          <a
            href={pdfHref}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-trust-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-trust-700"
          >
            <Download className="h-4 w-4" /> Baixar PDF
          </a>
        }
      />

      {/* Resumo executivo */}
      <Card className="mb-4">
        <CardTitle className="mb-2">Resumo executivo</CardTitle>
        <p className="text-sm leading-relaxed text-slate-600">
          A rede municipal acompanha <strong>{cards.totalChildren}</strong>{" "}
          crianças com TEA, com <strong>{cards.professionals}</strong>{" "}
          profissionais vinculados e <strong>{cards.activeFamilies}</strong>{" "}
          famílias ativas. No período ({filters.periodLabel.toLowerCase()}), foram
          lançados <strong>{cards.evolutionRecords}</strong> registros de evolução
          e <strong>{cards.contentsConsumed}</strong> acessos a conteúdos. A
          evolução média geral é de <strong>{cards.avgEvolution}%</strong>.
        </p>
      </Card>

      {/* Indicadores */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.l} className="text-center">
            <p className="text-2xl font-extrabold text-trust-700">{k.v}</p>
            <p className="text-xs text-slate-500">{k.l}</p>
          </Card>
        ))}
      </div>

      {/* Comparativo */}
      <div className="mb-4">
        <ComparisonBlock data={comparison} />
      </div>

      {/* Gráficos */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-2">Evolução média por mês</CardTitle>
          <MuniLineChart data={charts.evolutionByMonth} />
        </Card>
        <Card>
          <CardTitle className="mb-2">Distribuição por nível TEA</CardTitle>
          <MuniPieChart data={charts.teaLevels} />
        </Card>
        <Card>
          <CardTitle className="mb-2">Crianças por faixa etária</CardTitle>
          <MuniBarChart data={charts.ageBuckets} color="#128a6e" />
        </Card>
        <Card>
          <CardTitle className="mb-2">Conteúdos mais acessados</CardTitle>
          <MuniBarChart data={charts.topContents} color="#9b5bef" layout="horizontal" />
        </Card>
      </div>

      {/* Crianças acompanhadas */}
      <Card>
        <CardTitle className="mb-4">Crianças acompanhadas ({rows.length})</CardTitle>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Nome</th>
                <th className="pb-2 font-semibold">Idade</th>
                <th className="pb-2 font-semibold">Terapeuta</th>
                <th className="pb-2 font-semibold">Evolução</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 font-medium text-foreground">{r.name}</td>
                  <td className="py-2 text-slate-600">{r.age}</td>
                  <td className="py-2 text-slate-600">{r.therapist}</td>
                  <td className="py-2 font-bold text-brand-600">{r.evolution}%</td>
                  <td className="py-2">
                    <Badge tone={r.active ? "success" : "neutral"}>
                      {r.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

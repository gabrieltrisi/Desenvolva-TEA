import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  UsersRound,
  Stethoscope,
  ClipboardList,
  BookOpen,
  TrendingUp,
  FileText,
  FileBarChart,
} from "lucide-react";
import { Download } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { canViewMunicipio } from "@/lib/auth/rbac";
import { resolveAccessUser } from "@/lib/access/children";
import {
  getMunicipioData,
  getMunicipioComparison,
  parseMunicipioFilters,
  type MunicipioFilters,
} from "@/lib/municipio/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { KpiCard } from "@/components/municipio/kpi-card";
import { MunicipioFilterBar } from "@/components/municipio/filter-bar";
import { ComparisonBlock } from "@/components/municipio/comparison-block";
import {
  MuniLineChart,
  MuniBarChart,
  MuniPieChart,
} from "@/components/municipio/charts";

/** Monta a query string dos filtros atuais (para CSV e relatório). */
function filterQs(f: MunicipioFilters): string {
  const qs = new URLSearchParams();
  qs.set("period", f.period);
  if (f.period === "custom") {
    if (f.from) qs.set("from", f.from);
    if (f.to) qs.set("to", f.to);
  }
  if (f.level !== "all") qs.set("level", f.level);
  if (f.status !== "all") qs.set("status", f.status);
  return qs.toString();
}

export const metadata: Metadata = { title: "Painel Municipal" };

export default async function MunicipioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canViewMunicipio(session.role)) redirect("/dashboard");

  const user = await resolveAccessUser(session);
  const sp = await searchParams;
  const filters = parseMunicipioFilters(sp);
  const [data, comparison] = await Promise.all([
    getMunicipioData(user, filters),
    getMunicipioComparison(user, filters),
  ]);
  const { cards, charts, rows } = data;
  const qs = filterQs(filters);

  return (
    <>
      <PageHeader
        title="Painel Municipal"
        description="Visão executiva do impacto da plataforma na rede municipal."
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href={`/municipio/export/csv?${qs}`}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              <Download className="h-4 w-4" /> Exportar CSV
            </a>
            <Link
              href={`/relatorios/municipio?${qs}`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-trust-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-trust-700"
            >
              <FileBarChart className="h-4 w-4" /> Relatório consolidado
            </Link>
          </div>
        }
      />

      <div className="mb-6">
        <MunicipioFilterBar
          period={filters.period}
          level={filters.level}
          status={filters.status}
          from={filters.from}
          to={filters.to}
        />
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Users} label="Crianças cadastradas" value={cards.totalChildren} accent="#128a6e" />
        <KpiCard icon={UsersRound} label="Famílias ativas" value={cards.activeFamilies} accent="#3a6fe0" />
        <KpiCard icon={Stethoscope} label="Profissionais" value={cards.professionals} accent="#9b5bef" />
        <KpiCard icon={ClipboardList} label="Registros de evolução" value={cards.evolutionRecords} accent="#f97f3a" />
        <KpiCard icon={BookOpen} label="Conteúdos consumidos" value={cards.contentsConsumed} accent="#1cab88" />
        <KpiCard icon={TrendingUp} label="Evolução média geral" value={`${cards.avgEvolution}%`} accent="#22b07d" />
        <KpiCard icon={FileText} label="Relatórios emitidos" value={cards.reportsEmitted} accent="#ef5b8d" />
        <KpiCard icon={UsersRound} label="Crianças no filtro" value={rows.length} accent="#64748b" />
      </div>

      {/* Comparativo do período */}
      <div className="mb-6">
        <ComparisonBlock data={comparison} />
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-2">Evolução média por mês</CardTitle>
          <MuniLineChart data={charts.evolutionByMonth} />
        </Card>
        <Card>
          <CardTitle className="mb-2">Utilização da plataforma por semana</CardTitle>
          <MuniBarChart data={charts.weeklyUsage} color="#3a6fe0" />
        </Card>
        <Card>
          <CardTitle className="mb-2">Crianças por faixa etária</CardTitle>
          <MuniBarChart data={charts.ageBuckets} color="#128a6e" />
        </Card>
        <Card>
          <CardTitle className="mb-2">Distribuição por nível TEA</CardTitle>
          <MuniPieChart data={charts.teaLevels} />
        </Card>
        <Card className="lg:col-span-2">
          <CardTitle className="mb-2">Conteúdos mais acessados</CardTitle>
          <MuniBarChart data={charts.topContents} color="#9b5bef" layout="horizontal" />
        </Card>
      </div>

      {/* Tabela de acompanhamento */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Acompanhamento das crianças</CardTitle>
          <span className="text-sm text-slate-500">{rows.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 font-semibold">Criança</th>
                <th className="pb-3 font-semibold">Idade</th>
                <th className="pb-3 font-semibold">Responsável</th>
                <th className="pb-3 font-semibold">Terapeuta</th>
                <th className="pb-3 font-semibold">Evolução</th>
                <th className="pb-3 font-semibold">Último registro</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhuma criança encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5">
                      <Link
                        href={`/relatorios/crianca/${r.id}`}
                        className="flex items-center gap-2 font-semibold text-foreground hover:text-brand-600"
                      >
                        <Avatar name={r.name} color={r.avatarColor} className="h-8 w-8 text-xs" />
                        {r.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-slate-600">{r.age} anos</td>
                    <td className="py-2.5 text-slate-600">{r.guardian}</td>
                    <td className="py-2.5 text-slate-600">{r.therapist}</td>
                    <td className="py-2.5">
                      <span className="font-bold text-brand-600">{r.evolution}%</span>
                    </td>
                    <td className="py-2.5 text-slate-600">{r.lastRecord ?? "—"}</td>
                    <td className="py-2.5">
                      <Badge tone={r.active ? "success" : "neutral"}>
                        {r.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

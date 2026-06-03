import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type {
  MunicipioData,
  ChartPoint,
  MunicipioComparison,
} from "@/lib/municipio/data";

const BRAND = "#128a6e";
const TRUST = "#2856c4";
const TRUST_LIGHT = "#eef4ff";
const INK = "#16242f";
const MUTED = "#64748b";
const BORDER = "#e6ebf0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: TRUST,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandSub: { color: TRUST_LIGHT, fontSize: 9, marginTop: 2 },
  headerRight: { color: "#ffffff", fontSize: 9, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color: MUTED,
    fontSize: 8,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: TRUST,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  lead: { fontSize: 10, lineHeight: 1.5, color: "#334155" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kpi: {
    width: "31.5%",
    backgroundColor: TRUST_LIGHT,
    borderRadius: 6,
    padding: 8,
  },
  kpiValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: TRUST },
  kpiLabel: { fontSize: 8, color: MUTED, marginTop: 2 },
  chartRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  chartLabel: { width: 130, fontSize: 8 },
  chartTrack: { flex: 1, height: 9, backgroundColor: "#eef2f6", borderRadius: 3 },
  chartValue: { width: 38, fontSize: 8, textAlign: "right" },
  th: {
    flexDirection: "row",
    backgroundColor: "#f6f8fa",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },
  tr: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  td: { fontSize: 8 },
  metaRow: { flexDirection: "row", gap: 24, marginBottom: 8 },
  metaLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase" },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  cmpHead: {
    flexDirection: "row",
    backgroundColor: "#f6f8fa",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  cmpRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
});

const TREND_SYMBOL = { up: "▲", down: "▼", flat: "=" } as const;
const TREND_COLOR = { up: "#16a34a", down: "#ef4444", flat: "#64748b" } as const;

function Header() {
  return (
    <View style={styles.header} fixed>
      <View>
        <Text style={styles.brand}>Desenvolva TEA</Text>
        <Text style={styles.brandSub}>Relatório Municipal Consolidado</Text>
      </View>
      <Text style={styles.headerRight}>Secretaria Municipal de Educação</Text>
    </View>
  );
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Relatório gerado automaticamente · {generatedAt}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  );
}

function HBars({
  data,
  color,
  suffix = "",
}: {
  data: ChartPoint[];
  color: string;
  suffix?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0)
    return <Text style={{ color: MUTED }}>Sem dados no período.</Text>;
  return (
    <View>
      {data.map((d, i) => (
        <View key={i} style={styles.chartRow}>
          <Text style={styles.chartLabel}>{d.label}</Text>
          <View style={styles.chartTrack}>
            <View
              style={{
                width: `${(d.value / max) * 100}%`,
                height: 9,
                backgroundColor: color,
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={styles.chartValue}>
            {d.value}
            {suffix}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MunicipioReportDocument({
  data,
  comparison,
}: {
  data: MunicipioData;
  comparison: MunicipioComparison;
}) {
  const c = data.cards;
  const kpis = [
    { v: c.totalChildren, l: "Crianças cadastradas" },
    { v: c.activeFamilies, l: "Famílias ativas" },
    { v: c.professionals, l: "Profissionais vinculados" },
    { v: c.evolutionRecords, l: "Registros de evolução" },
    { v: c.contentsConsumed, l: "Conteúdos consumidos" },
    { v: `${c.avgEvolution}%`, l: "Evolução média geral" },
  ];
  const activeCount = data.rows.filter((r) => r.active).length;
  const tableRows = data.rows.slice(0, 24);

  return (
    <Document title="Relatório Municipal Consolidado" author="Desenvolva TEA">
      <Page size="A4" style={styles.page}>
        <Header />
        <Footer generatedAt={data.generatedAt} />

        {/* Metadados do relatório */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Período analisado</Text>
            <Text style={styles.metaValue}>{data.filters.periodLabel}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Data de geração</Text>
            <Text style={styles.metaValue}>{data.generatedAt}</Text>
          </View>
        </View>

        {/* Resumo executivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo executivo</Text>
          <Text style={styles.lead}>
            A rede municipal acompanha {c.totalChildren} crianças com TEA por
            meio da plataforma Desenvolva TEA, com {c.professionals} profissionais
            vinculados e {c.activeFamilies} famílias ativas. No período avaliado
            ({data.filters.periodLabel.toLowerCase()}), foram lançados{" "}
            {c.evolutionRecords} registros de evolução e {c.contentsConsumed}{" "}
            acessos a conteúdos terapêuticos. A evolução média geral das crianças
            é de {c.avgEvolution}%, com {activeCount} crianças ativas no período.
          </Text>
        </View>

        {/* Indicadores gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores gerais</Text>
          <View style={styles.kpiRow}>
            {kpis.map((k, i) => (
              <View key={i} style={styles.kpi}>
                <Text style={styles.kpiValue}>{k.v}</Text>
                <Text style={styles.kpiLabel}>{k.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Comparativo com período anterior */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Comparativo com período anterior</Text>
          <View style={styles.cmpHead}>
            <Text style={[styles.thText, { flex: 1 }]}>Indicador</Text>
            <Text style={[styles.thText, { width: 70, textAlign: "right" }]}>Atual</Text>
            <Text style={[styles.thText, { width: 70, textAlign: "right" }]}>Anterior</Text>
            <Text style={[styles.thText, { width: 90, textAlign: "right" }]}>Variação</Text>
          </View>
          {comparison.metrics.map((m, i) => (
            <View key={i} style={styles.cmpRow}>
              <Text style={[styles.td, { flex: 1 }]}>{m.label}</Text>
              <Text style={[styles.td, { width: 70, textAlign: "right" }]}>
                {m.current}
                {m.suffix}
              </Text>
              <Text style={[styles.td, { width: 70, textAlign: "right" }]}>
                {m.previous}
                {m.suffix}
              </Text>
              <Text
                style={{
                  width: 90,
                  fontSize: 8,
                  textAlign: "right",
                  color: TREND_COLOR[m.direction],
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {TREND_SYMBOL[m.direction]} {m.delta > 0 ? "+" : ""}
                {m.delta}
                {m.suffix}
                {m.pct != null ? ` (${m.pct > 0 ? "+" : ""}${m.pct}%)` : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* Gráficos */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Evolução média por mês</Text>
          <HBars data={data.charts.evolutionByMonth} color={BRAND} suffix="%" />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Distribuição por nível TEA</Text>
          <HBars data={data.charts.teaLevels} color={TRUST} />
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Crianças por faixa etária</Text>
          <HBars data={data.charts.ageBuckets} color="#9b5bef" />
        </View>

        {/* Top métricas: conteúdos mais acessados */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Conteúdos mais acessados</Text>
          <HBars data={data.charts.topContents} color="#f97f3a" />
        </View>

        {/* Crianças acompanhadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Crianças acompanhadas{" "}
            {data.rows.length > tableRows.length
              ? `(mostrando ${tableRows.length} de ${data.rows.length})`
              : `(${data.rows.length})`}
          </Text>
          <View style={styles.th}>
            <Text style={[styles.thText, { flex: 1 }]}>Nome</Text>
            <Text style={[styles.thText, { width: 40 }]}>Idade</Text>
            <Text style={[styles.thText, { width: 120 }]}>Terapeuta</Text>
            <Text style={[styles.thText, { width: 50 }]}>Evol.</Text>
            <Text style={[styles.thText, { width: 45 }]}>Status</Text>
          </View>
          {tableRows.map((r, i) => (
            <View key={i} style={styles.tr} wrap={false}>
              <Text style={[styles.td, { flex: 1 }]}>{r.name}</Text>
              <Text style={[styles.td, { width: 40 }]}>{r.age}</Text>
              <Text style={[styles.td, { width: 120 }]}>{r.therapist}</Text>
              <Text style={[styles.td, { width: 50 }]}>{r.evolution}%</Text>
              <Text style={[styles.td, { width: 45 }]}>
                {r.active ? "Ativo" : "Inativo"}
              </Text>
            </View>
          ))}
        </View>

        {/* Observações finais */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Observações finais</Text>
          <Text style={styles.lead}>
            Os indicadores demonstram engajamento consistente das famílias e
            profissionais com a plataforma. Recomenda-se priorizar o
            acompanhamento das crianças marcadas como inativas no período e
            ampliar a oferta dos conteúdos mais acessados. Este relatório foi
            gerado automaticamente a partir dos dados registrados na plataforma
            Desenvolva TEA e destina-se ao acompanhamento institucional pela
            Secretaria Municipal de Educação.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Renderiza o relatório municipal consolidado em um Buffer de PDF. */
export function renderMunicipioReportPdf(
  data: MunicipioData,
  comparison: MunicipioComparison,
): Promise<Buffer> {
  return renderToBuffer(
    <MunicipioReportDocument data={data} comparison={comparison} />,
  );
}

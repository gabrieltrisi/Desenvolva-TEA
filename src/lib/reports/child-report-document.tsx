import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ChildReportData } from "./data";

const BRAND = "#128a6e";
const BRAND_LIGHT = "#eafaf5";
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
  // Cabeçalho
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: BRAND,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandSub: { color: BRAND_LIGHT, fontSize: 9, marginTop: 2 },
  headerRight: { color: "#ffffff", fontSize: 9, textAlign: "right" },
  // Rodapé
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
  // Seções
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  row: { flexDirection: "row" },
  // Identificação
  idGrid: { flexDirection: "row", flexWrap: "wrap" },
  idItem: { width: "50%", marginBottom: 6 },
  idLabel: { color: MUTED, fontSize: 8, textTransform: "uppercase" },
  idValue: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 1 },
  // Cartões de destaque
  statRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  statCard: {
    flex: 1,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BRAND },
  statLabel: { fontSize: 8, color: MUTED, marginTop: 2 },
  // Métricas (barras horizontais)
  metricRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  metricLabel: { width: 110, fontSize: 9 },
  metricTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
  },
  metricValue: { width: 56, fontSize: 9, textAlign: "right" },
  // Gráfico de barras
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    gap: 4,
    paddingTop: 8,
  },
  chartCol: { flex: 1, alignItems: "center" },
  chartLabel: { fontSize: 7, color: MUTED, marginTop: 3 },
  // Tabela
  th: {
    flexDirection: "row",
    backgroundColor: "#f6f8fa",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED },
  tr: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  td: { fontSize: 9 },
  chip: {
    fontSize: 8,
    color: BRAND,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bullet: { flexDirection: "row", marginBottom: 3 },
});

function Header() {
  return (
    <View style={styles.header} fixed>
      <View>
        <Text style={styles.brand}>Desenvolva TEA</Text>
        <Text style={styles.brandSub}>Relatório de Acompanhamento</Text>
      </View>
      <Text style={styles.headerRight}>Saúde · Educação · Inclusão</Text>
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

function MetricBars({ metrics }: { metrics: ChildReportData["metrics"] }) {
  return (
    <View>
      {metrics.map((m) => (
        <View key={m.label} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{m.label}</Text>
          <View style={styles.metricTrack}>
            <View
              style={{
                width: `${Math.max(0, Math.min(100, m.value))}%`,
                height: 8,
                backgroundColor: m.color,
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={styles.metricValue}>
            {m.value}%{" "}
            {m.trend !== 0
              ? `(${m.trend > 0 ? "+" : ""}${m.trend})`
              : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

function BarChart({ data }: { data: ChildReportData["timeline"] }) {
  if (data.length === 0) {
    return <Text style={{ color: MUTED }}>Sem registros no período.</Text>;
  }
  const max = 100;
  return (
    <View style={styles.chart}>
      {data.map((p, i) => (
        <View key={i} style={styles.chartCol}>
          <View
            style={{
              width: 14,
              height: Math.max(2, (p.value / max) * 92),
              backgroundColor: BRAND,
              borderRadius: 2,
            }}
          />
          <Text style={styles.chartLabel}>{p.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ChildReportDocument({ data }: { data: ChildReportData }) {
  return (
    <Document
      title={`Relatório - ${data.child.name}`}
      author="Desenvolva TEA"
    >
      <Page size="A4" style={styles.page}>
        <Header />
        <Footer generatedAt={data.generatedAt} />

        {/* Identificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <View style={styles.idGrid}>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Criança</Text>
              <Text style={styles.idValue}>
                {data.child.name}, {data.child.age} anos
              </Text>
            </View>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Nível de suporte</Text>
              <Text style={styles.idValue}>
                {data.child.supportLevel
                  ? `TEA Nível ${data.child.supportLevel}`
                  : "Não informado"}
              </Text>
            </View>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Responsável</Text>
              <Text style={styles.idValue}>{data.guardians}</Text>
            </View>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Terapeuta</Text>
              <Text style={styles.idValue}>{data.therapistName}</Text>
            </View>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Tempo de acompanhamento</Text>
              <Text style={styles.idValue}>{data.accompanied}</Text>
            </View>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Período do relatório</Text>
              <Text style={styles.idValue}>{data.window.label}</Text>
            </View>
          </View>
        </View>

        {/* Destaques */}
        <View style={styles.section}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {data.child.overallEvolution}%
              </Text>
              <Text style={styles.statLabel}>Evolução geral</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.sessionsCompleted}</Text>
              <Text style={styles.statLabel}>Sessões realizadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.achievements.length}</Text>
              <Text style={styles.statLabel}>Conquistas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.sessionsInRange}</Text>
              <Text style={styles.statLabel}>Sessões no período</Text>
            </View>
          </View>
        </View>

        {/* Métricas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores de desenvolvimento</Text>
          <MetricBars metrics={data.metrics} />
        </View>

        {/* Evolução temporal */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            Evolução temporal — {data.window.label}
          </Text>
          <BarChart data={data.timeline} />
        </View>

        {/* Conquistas */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Conquistas recentes</Text>
          {data.achievements.length === 0 ? (
            <Text style={{ color: MUTED }}>Nenhuma conquista registrada.</Text>
          ) : (
            data.achievements.map((a, i) => (
              <View key={i} style={styles.bullet}>
                <Text>• {a.title}</Text>
                <Text style={{ color: MUTED }}> — {a.earnedAt}</Text>
              </View>
            ))
          )}
        </View>

        {/* Histórico resumido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico resumido</Text>
          {data.records.length === 0 ? (
            <Text style={{ color: MUTED }}>
              Sem registros de evolução no período.
            </Text>
          ) : (
            <View>
              <View style={styles.th}>
                <Text style={[styles.thText, { width: 70 }]}>Data</Text>
                <Text style={[styles.thText, { width: 70 }]}>Categoria</Text>
                <Text style={[styles.thText, { width: 60 }]}>Desemp.</Text>
                <Text style={[styles.thText, { flex: 1 }]}>Observação</Text>
              </View>
              {data.records.map((r, i) => (
                <View key={i} style={styles.tr} wrap={false}>
                  <Text style={[styles.td, { width: 70 }]}>{r.date}</Text>
                  <View style={{ width: 70 }}>
                    <Text style={styles.chip}>{r.category}</Text>
                  </View>
                  <Text style={[styles.td, { width: 60 }]}>
                    {r.performance}/5
                  </Text>
                  <Text style={[styles.td, { flex: 1 }]}>{r.note ?? "—"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

/** Renderiza o relatório individual em um Buffer de PDF (lado servidor). */
export function renderChildReportPdf(data: ChildReportData): Promise<Buffer> {
  return renderToBuffer(<ChildReportDocument data={data} />);
}

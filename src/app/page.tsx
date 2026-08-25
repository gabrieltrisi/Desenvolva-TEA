import Link from "next/link";
import {
  HeartHandshake,
  ArrowRight,
  FileBarChart,
  Building2,
  Users,
  Sparkles,
  Search,
  ClipboardList,
  Map,
  TrendingUp,
  Gamepad2,
  Video,
  School,
  MessageSquareQuote,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Desenvolva TEA — Acompanhamento do desenvolvimento infantil",
  description:
    "Plataforma que conecta famílias, profissionais e prefeituras no acompanhamento de crianças com TEA — trilhas terapêuticas, registros de evolução, biblioteca de vídeos e relatórios profissionais.",
};

const STATS = [
  { value: "6+", label: "especialidades integradas" },
  { value: "4", label: "perfis de acesso" },
  { value: "PDF + CSV", label: "relatórios e exportações" },
  { value: "100%", label: "digital e acessível" },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Perfil personalizado",
    text: "A família registra o perfil da criança — nível de suporte, responsáveis e acompanhamento. A plataforma organiza o ponto de partida.",
  },
  {
    icon: Map,
    title: "Trilha terapêutica",
    text: "Atividades e conteúdos por área do desenvolvimento — fala, motricidade, cognição — com progresso visível ao longo do tempo.",
  },
  {
    icon: HeartHandshake,
    title: "Rede conectada",
    text: "Profissionais registram a evolução, a prefeitura acompanha indicadores do seu município. Todos falam a mesma língua.",
  },
  {
    icon: TrendingUp,
    title: "Evolução documentada",
    text: "Relatórios automáticos por criança e por período — prontos para a escola, o plano de saúde e a Secretaria de Educação.",
  },
];

const DIFERENCIAIS = [
  {
    icon: Map,
    title: "Trilhas terapêuticas",
    text: "Sequências de atividades por especialidade, adaptadas ao nível e ao perfil da criança. A repetição vira hábito.",
    color: "#1cab88",
    bg: "#eafaf5",
  },
  {
    icon: Gamepad2,
    title: "Atividades interativas",
    text: "Jogos e exercícios gamificados que engajam a criança no tratamento de forma lúdica e acessível.",
    color: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    icon: Video,
    title: "Vídeos educacionais",
    text: "Biblioteca de conteúdo terapêutico por especialidade — como aplicar exercícios em casa e técnicas de regulação.",
    color: "#3a6fe0",
    bg: "#eef4ff",
  },
  {
    icon: FileBarChart,
    title: "Relatórios e exportação",
    text: "PDFs profissionais por criança e por período, além de exportação CSV — prontos para uso institucional.",
    color: "#9b5bef",
    bg: "#f3edff",
  },
  {
    icon: Building2,
    title: "Multi-prefeitura e governança",
    text: "Cada prefeitura enxerga apenas os pacientes aprovados do seu município, com fluxo de aprovação de vínculos.",
    color: "#0d6b4f",
    bg: "#e6f4ef",
  },
  {
    icon: Users,
    title: "Rede conectada",
    text: "Família, profissional e gestão pública no mesmo ambiente — com acesso seguro e segmentado por perfil.",
    color: "#f97f3a",
    bg: "#fff7ed",
  },
];

const PUBLICOS = [
  {
    icon: HeartHandshake,
    title: "Famílias",
    text: "Acompanham a trilha da criança, registram o dia a dia e veem o progresso em um painel claro e acolhedor.",
    color: "#1cab88",
    bg: "#eafaf5",
  },
  {
    icon: Users,
    title: "Profissionais",
    text: "Centralizam registros de evolução e relatórios — mais tempo para o cuidado, menos para a papelada.",
    color: "#3a6fe0",
    bg: "#eef4ff",
  },
  {
    icon: Building2,
    title: "Prefeituras",
    text: "Visão executiva do impacto na rede municipal, com indicadores, comparativos e relatórios consolidados.",
    color: "#9b5bef",
    bg: "#f3edff",
  },
  {
    icon: School,
    title: "Escolas",
    text: "Acompanhamento pedagógico integrado ao plano terapêutico e canal com a família.",
    color: "#f59e0b",
    bg: "#fef3c7",
    roadmap: true,
  },
];

const CHECKLIST_CATEGORIES = [
  "🗣️ Fala e comunicação",
  "👥 Socialização",
  "🌀 Sensorial",
  "🍽️ Alimentação",
  "😴 Sono",
  "🏃 Motor",
];

export default async function LandingPage() {
  const session = await getSession();
  const ctaHref = session ? "/dashboard" : "/login";
  const ctaLabel = session ? "Ir para o painel" : "Entrar";

  return (
    <div className="min-h-screen bg-cream text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#como-funciona" className="hover:text-brand-600">Como funciona</a>
            <a href="#diferenciais" className="hover:text-brand-600">Diferenciais</a>
            <a href="#para-quem" className="hover:text-brand-600">Para quem</a>
            <Link href="/checklist" className="font-bold text-pine hover:text-brand-700">
              Ver sinais
            </Link>
          </nav>
          <Link
            href={ctaHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-cream to-trust-50" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
          {/* Texto */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Saúde · Educação · Inclusão
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink lg:text-5xl">
              O desenvolvimento da criança com TEA começa com{" "}
              <em className="text-brand-600">informação e rotina.</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              O Desenvolva TEA conecta famílias, profissionais e prefeituras em
              torno de um objetivo: ampliar a autonomia e a qualidade de vida de
              cada criança no espectro — com trilhas, registros de evolução e
              relatórios profissionais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                Começar agora <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-surface-muted"
              >
                Como funciona
              </a>
            </div>

            {/* CTA do checklist público (rota real /checklist) */}
            <Link
              href="/checklist"
              className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border-[1.5px] border-amber-300 bg-gold-soft px-4 py-3.5 transition-colors hover:border-gold"
            >
              <span className="text-2xl" aria-hidden>🔍</span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-amber-800">
                  Meu filho tem algum sinal de TEA?
                </span>
                <span className="block text-xs text-amber-700">
                  Responda o checklist gratuito de sinais →
                </span>
              </span>
            </Link>
          </div>

          {/* Card visual ilustrativo (mock de marketing — sem dados reais) */}
          <div className="relative" aria-hidden>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_8px_40px_rgba(13,107,79,0.12)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
                  🧒
                </span>
                <div>
                  <p className="font-bold text-ink">Exemplo · TEA Nível 1</p>
                  <p className="text-xs text-slate-500">Fono · Psico · T.O.</p>
                </div>
              </div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Trilha desta semana
              </p>
              <div className="mb-4 space-y-2">
                {[
                  { emoji: "🗣️", label: "Exercício de fala", pct: 80, color: "#1cab88" },
                  { emoji: "🧩", label: "Memória visual", pct: 50, color: "#3a6fe0" },
                  { emoji: "🏃", label: "Coordenação motora", pct: 30, color: "#f59e0b" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2 rounded-xl bg-surface-muted p-2.5">
                    <span className="text-base">{t.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{t.label}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: t.color }}>
                      {t.pct}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { n: "24", l: "Sessões", c: "#0d6b4f" },
                  { n: "12", l: "Conquistas", c: "#3a6fe0" },
                  { n: "240", l: "XP", c: "#d97706" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-surface-muted py-2.5">
                    <span className="block font-display text-xl font-bold" style={{ color: s.c }}>
                      {s.n}
                    </span>
                    <span className="text-[10px] text-slate-500">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Ilustração de marketing — dados fictícios.
            </p>
          </div>
        </div>
      </section>

      {/* Faixa de números */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold text-brand-600">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por que existe */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8 lg:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-amber-800">
          💡 Por que existe
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
          O tratamento do TEA é complexo. A plataforma não precisa ser.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Cada criança no espectro é única. O tratamento exige múltiplos
          profissionais, rotina estruturada e repetição consistente. O grande
          inimigo do progresso é a <strong>falta de comunicação</strong> entre
          quem cuida — o Desenvolva TEA coloca todos na mesma página.
        </p>
      </section>

      {/* Como funciona — timeline */}
      <section id="como-funciona" className="bg-pine">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-20">
          <h2 className="font-display text-3xl font-bold italic tracking-tight text-white">
            Como funciona
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-white shadow-sm">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-bold text-white/60">
                    Passo {i + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Checklist teaser */}
      <section id="checklist" className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="rounded-3xl border-[1.5px] border-gold bg-white p-7 shadow-[0_4px_24px_rgba(245,158,11,0.12)]">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden>🔍</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink">
                  Checklist de sinais gratuito
                </h2>
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  Gratuito
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Para pais, professores e cuidadores
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Percebeu algo diferente no desenvolvimento da criança? Responda a um
            checklist de sinais sobre comportamento, comunicação, alimentação e
            sono, e receba orientação sobre os próximos passos — sem precisar de
            cadastro.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Este recurso é informativo e <strong>não substitui avaliação ou
            diagnóstico médico</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHECKLIST_CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-lg bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-amber-800"
              >
                {c}
              </span>
            ))}
          </div>
          <Link
            href="/checklist"
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Search className="h-4 w-4" aria-hidden /> Responder o checklist
          </Link>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              ⭐ Diferenciais
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
              Tudo que o tratamento precisa, em um só lugar
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIAIS.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-cream p-6 transition-shadow hover:shadow-md"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: f.bg, color: f.color }}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section id="para-quem" className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-100 px-3 py-1 text-xs font-bold text-trust-700">
            🌐 Para quem
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
            Uma rede inteira de cuidado
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLICOS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-lg font-bold text-ink">{p.title}</h3>
                  {p.roadmap && (
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Roadmap
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Depoimento ilustrativo */}
      <section className="bg-pine">
        <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-16 lg:px-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/15" aria-hidden />
          <MessageSquareQuote className="h-9 w-9 text-gold" aria-hidden />
          <p className="mt-4 font-display text-2xl font-bold italic leading-snug text-white">
            “A rotina visual e as trilhas de atividade fizeram diferença. Ver o
            progresso documentado nos dá esperança e clareza do próximo passo.”
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg" aria-hidden>
              👩
            </span>
            <div>
              <p className="text-sm font-bold text-white">Família participante</p>
              <p className="text-xs text-white/70">Depoimento ilustrativo</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">
            Comece agora a acompanhar cada passo
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50/90">
            Acesse a plataforma e veja como o Desenvolva TEA apoia famílias,
            profissionais e a gestão pública.
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-brand-700 shadow-sm hover:bg-brand-50"
          >
            {ctaLabel} <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row lg:px-8">
          <Logo size="sm" />
          <nav className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-brand-600">Privacidade</Link>
            <Link href="/termos" className="hover:text-brand-600">Termos de Uso</Link>
          </nav>
          <p>Saúde · Educação · Inclusão — © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

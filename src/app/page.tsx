import Link from "next/link";
import {
  HeartHandshake,
  ArrowRight,
  Baby,
  Route,
  BookOpen,
  LineChart,
  FileBarChart,
  Building2,
  ShieldCheck,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Desenvolva TEA — Acompanhamento do desenvolvimento infantil",
  description:
    "Plataforma SaaS para acompanhamento de crianças com TEA, conectando famílias, profissionais e secretarias municipais de educação.",
};

const BENEFITS = [
  {
    icon: HeartHandshake,
    title: "Para famílias",
    text: "Acompanhe a evolução da criança, registre o dia a dia e veja o progresso em um painel claro e acolhedor.",
    color: "#1cab88",
  },
  {
    icon: Users,
    title: "Para profissionais",
    text: "Centralize registros, trilhas terapêuticas e relatórios — mais tempo para o cuidado, menos para a papelada.",
    color: "#3a6fe0",
  },
  {
    icon: Building2,
    title: "Para prefeituras",
    text: "Visão executiva do impacto na rede municipal, com indicadores, comparativos e relatórios consolidados em PDF.",
    color: "#9b5bef",
  },
];

const FEATURES = [
  { icon: Baby, title: "Cadastro de crianças", text: "Perfil completo com nível de suporte e responsáveis." },
  { icon: LineChart, title: "Acompanhamento de evolução", text: "Registros diários e gráficos temporais com Recharts." },
  { icon: Route, title: "Trilhas de aprendizagem", text: "Sequências de atividades por área do desenvolvimento." },
  { icon: BookOpen, title: "Biblioteca terapêutica", text: "Conteúdos e guias para apoiar o cuidado em casa." },
  { icon: FileBarChart, title: "Relatórios em PDF", text: "Relatórios profissionais por criança e consolidados." },
  { icon: Building2, title: "Painel municipal", text: "Indicadores executivos, comparativos e exportação CSV." },
];

const STATS = [
  { value: "100%", label: "digital e acessível" },
  { value: "3 perfis", label: "família, profissional, prefeitura" },
  { value: "PDF + CSV", label: "exportações reais" },
  { value: "Multi-tenant", label: "pronto para escalar" },
];

export default async function LandingPage() {
  const session = await getSession();
  const ctaHref = session ? "/dashboard" : "/login";
  const ctaLabel = session ? "Ir para o painel" : "Entrar";

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#sobre" className="hover:text-brand-600">O que é</a>
            <a href="#beneficios" className="hover:text-brand-600">Benefícios</a>
            <a href="#funcionalidades" className="hover:text-brand-600">Funcionalidades</a>
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-trust-50" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Saúde · Educação · Inclusão
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
              Cada criança no seu tempo, com apoio em{" "}
              <span className="text-brand-500">cada passo</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              O Desenvolva TEA conecta famílias, profissionais e prefeituras em
              uma só plataforma para acompanhar o desenvolvimento de crianças com
              Transtorno do Espectro Autista — com trilhas, registros de evolução
              e relatórios profissionais.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                {ctaLabel} <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-white px-6 text-base font-semibold text-foreground hover:bg-surface-muted"
              >
                Conhecer funcionalidades
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de números */}
      <section className="border-y border-border bg-surface-muted">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O que é */}
      <section id="sobre" className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              O que é o Desenvolva TEA?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Uma plataforma web pensada para humanizar e organizar o
              acompanhamento terapêutico e educacional de crianças com TEA. Tudo
              em um ambiente seguro, acessível e fácil de usar — do registro
              diário da família ao painel executivo da Secretaria de Educação.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Centraliza informações de famílias e profissionais",
                "Acompanha a evolução com dados e gráficos reais",
                "Gera relatórios profissionais para impressão",
                "Oferece visão municipal para gestão pública",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-trust-600 via-trust-500 to-brand-400 p-8 text-white shadow-sm">
            <ShieldCheck className="h-10 w-10" />
            <p className="mt-4 text-xl font-bold leading-snug">
              Visual leve, confiável e humanizado — feito para acolher cada
              família e apoiar cada profissional.
            </p>
            <p className="mt-4 text-sm text-brand-50/90">
              Acessibilidade, clareza e dados que geram cuidado.
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">
            Benefícios para toda a rede de cuidado
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${b.color}1a`, color: b.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">
          Funcionalidades
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Tudo o que famílias, profissionais e gestores precisam, em um só lugar.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Pronto para transformar o acompanhamento do TEA?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50/90">
            Acesse a plataforma e veja como o Desenvolva TEA apoia famílias,
            profissionais e a gestão pública.
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-brand-700 shadow-sm hover:bg-brand-50"
          >
            {ctaLabel} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row lg:px-8">
          <Logo size="sm" />
          <nav className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-brand-600">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-brand-600">
              Termos de Uso
            </Link>
          </nav>
          <p>Saúde · Educação · Inclusão — © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

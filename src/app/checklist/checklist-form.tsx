"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  CATEGORIES,
  SIGNS,
  WEIGHT_LABEL,
  computeResult,
  RESULT_META,
  type ResultLevel,
} from "@/lib/checklist/signs";

type Step = "intro" | "perguntas" | "resultado";

const WHO_OPTIONS = [
  { value: "mae-pai", label: "Mãe / Pai", emoji: "👨‍👩‍👧" },
  { value: "professor", label: "Professor(a)", emoji: "🏫" },
  { value: "cuidador", label: "Cuidador(a)", emoji: "🤝" },
  { value: "profissional", label: "Profissional", emoji: "👩‍⚕️" },
];

const AGE_OPTIONS = ["0–12 meses", "1–2 anos", "2–4 anos", "4–8 anos", "8–12 anos", "12+ anos"];

const TONE: Record<
  ResultLevel,
  { box: string; chip: string; icon: typeof CheckCircle2 }
> = {
  leve: {
    box: "border-brand-200 bg-brand-50",
    chip: "bg-brand-100 text-brand-700",
    icon: CheckCircle2,
  },
  atencao: {
    box: "border-amber-300 bg-gold-soft",
    chip: "bg-amber-100 text-amber-800",
    icon: AlertCircle,
  },
  alta: {
    box: "border-red-200 bg-red-50",
    chip: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
};

const SEVERITY_CLASS: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-800",
  baixa: "bg-slate-100 text-slate-600",
};

function Disclaimer() {
  return (
    <p className="rounded-xl border border-border bg-white px-4 py-3 text-xs leading-relaxed text-slate-500">
      ⚠️ Este checklist é apenas uma ferramenta informativa e{" "}
      <strong>não substitui avaliação médica, psicológica ou terapêutica</strong>.
      Nenhuma resposta é salva ou enviada.
    </p>
  );
}

export function ChecklistForm() {
  const [step, setStep] = useState<Step>("intro");
  const [who, setWho] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const result = useMemo(() => computeResult(selected), [selected]);
  const progressPct = Math.round((selected.length / SIGNS.length) * 100);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function restart() {
    setSelected([]);
    setWho(null);
    setAge(null);
    setStep("intro");
  }

  // ─── INTRO ───────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-amber-800">
            🔍 Identificação precoce
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink">
            Você percebeu algo diferente no desenvolvimento da criança?
          </h1>
          <p className="mt-3 leading-relaxed text-slate-600">
            Responda com calma — não existe resposta certa ou errada. Ao final,
            você recebe uma orientação sobre os próximos passos.
          </p>
        </div>

        <Disclaimer />

        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Quem está respondendo? <span className="font-normal normal-case">(opcional)</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {WHO_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={who === o.value}
                onClick={() => setWho(who === o.value ? null : o.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  who === o.value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border bg-white text-slate-600 hover:bg-surface-muted"
                }`}
              >
                <span aria-hidden>{o.emoji}</span> {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Idade da criança <span className="font-normal normal-case">(opcional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={age === a}
                onClick={() => setAge(age === a ? null : a)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  age === a
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border bg-white text-slate-600 hover:bg-surface-muted"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setStep("perguntas")}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          Começar o checklist <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    );
  }

  // ─── PERGUNTAS ───────────────────────────────────────────
  if (step === "perguntas") {
    return (
      <div className="space-y-6">
        {/* Barra de progresso de sinais marcados */}
        <div className="sticky top-0 z-10 -mx-4 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:px-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-ink">Sinais observados</span>
            <span className="text-slate-500" aria-live="polite">
              {selected.length} selecionado{selected.length === 1 ? "" : "s"}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuenow={selected.length}
            aria-valuemin={0}
            aria-valuemax={SIGNS.length}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {CATEGORIES.map((cat) => {
          const items = SIGNS.filter((s) => s.category === cat.key);
          if (items.length === 0) return null;
          return (
            <fieldset key={cat.key} className="space-y-2">
              <legend className="mb-1 flex items-center gap-2 text-sm font-bold text-ink">
                <span aria-hidden>{cat.emoji}</span> {cat.label}
              </legend>
              {items.map((s) => {
                const checked = selected.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-colors ${
                      checked ? "border-brand-400 ring-1 ring-brand-200" : "border-border hover:bg-surface-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(s.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-brand-500"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-foreground">
                        {s.label}
                      </span>
                      <span className="block text-xs text-slate-500">{s.hint}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_CLASS[s.weight]}`}
                    >
                      {WEIGHT_LABEL[s.weight]}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStep("intro")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground hover:bg-surface-muted sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
          </button>
          <button
            type="button"
            onClick={() => setStep("resultado")}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            Ver resultado <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  // ─── RESULTADO ───────────────────────────────────────────
  const meta = RESULT_META[result.level];
  const tone = TONE[result.level];
  const ToneIcon = tone.icon;
  const markedSigns = SIGNS.filter((s) => selected.includes(s.id));

  return (
    <div className="space-y-6">
      <div
        className={`rounded-3xl border-[1.5px] p-6 ${tone.box}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <ToneIcon className="h-8 w-8 shrink-0 text-ink" aria-hidden />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{meta.title}</h1>
            <p className="text-sm text-slate-600">{meta.tagline}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">{meta.explanation}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone.chip}`}>
            {result.total} sinal{result.total === 1 ? "" : "is"} marcado{result.total === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            Alta: {result.alta} · Média: {result.media} · Baixa: {result.baixa}
          </span>
          {result.regression && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              Regressão observada
            </span>
          )}
        </div>
      </div>

      {result.byCategory.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-ink">Categorias com mais sinais</h2>
          <ul className="space-y-2">
            {result.byCategory.map((c) => (
              <li key={c.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  <span aria-hidden>{c.emoji}</span> {c.label}
                </span>
                <span className="font-bold text-brand-700">
                  {c.count} sinal{c.count === 1 ? "" : "is"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {markedSigns.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-ink">Sinais que você marcou</h2>
          <ul className="space-y-1.5">
            {markedSigns.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                {s.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-ink">Próximos passos recomendados</h2>
        <ol className="space-y-2.5">
          {meta.nextSteps.map((stepText, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              {stepText}
            </li>
          ))}
        </ol>
      </div>

      <Disclaimer />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Search className="h-4 w-4" aria-hidden /> Entrar na plataforma
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground hover:bg-surface-muted"
        >
          Conhecer o Desenvolva TEA
        </Link>
        <button
          type="button"
          onClick={restart}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground hover:bg-surface-muted"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
        </button>
      </div>
    </div>
  );
}

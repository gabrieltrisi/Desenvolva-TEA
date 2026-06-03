"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingField } from "@/components/evolution/rating-field";
import { MoodField } from "@/components/evolution/mood-field";
import {
  EVOLUTION_CATEGORIES,
  EVOLUTION_CATEGORY_LABELS,
  RATING_FIELDS,
} from "@/lib/labels";
import {
  createEvolutionRecordAction,
  type EvolutionFormState,
} from "@/lib/evolution/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar registro"}
    </Button>
  );
}

export function EvolutionForm({
  kids,
  defaultChildId,
  defaultDate,
}: {
  kids: { id: string; name: string }[];
  defaultChildId: string;
  defaultDate: string;
}) {
  const [state, formAction] = useActionState<EvolutionFormState, FormData>(
    createEvolutionRecordAction,
    {},
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* Criança + Data + Categoria */}
      <div className="grid gap-5 sm:grid-cols-2">
        {kids.length > 1 ? (
          <div className="space-y-1.5">
            <label htmlFor="childId" className="block text-sm font-semibold text-foreground">
              Criança
            </label>
            <select
              id="childId"
              name="childId"
              defaultValue={defaultChildId}
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm focus:border-trust-400"
            >
              {kids.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="childId" value={defaultChildId} />
        )}

        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-semibold text-foreground">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm focus:border-trust-400"
            required
          />
          {fe.date && <p className="text-xs font-medium text-red-500">{fe.date}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-semibold text-foreground">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            defaultValue="GENERAL"
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm focus:border-trust-400"
          >
            {EVOLUTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EVOLUTION_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Humor */}
      <MoodField defaultValue={3} error={fe.mood} />

      {/* Notas 1–5 */}
      <div className="grid gap-5 sm:grid-cols-2">
        {RATING_FIELDS.map((f) => (
          <RatingField
            key={f.name}
            name={f.name}
            label={f.label}
            defaultValue={3}
            error={fe[f.name]}
          />
        ))}
      </div>

      {/* Observação */}
      <div className="space-y-1.5">
        <label htmlFor="note" className="block text-sm font-semibold text-foreground">
          Observação <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-slate-400 focus:border-trust-400"
          placeholder="O que aconteceu hoje? Avanços, desafios, contexto..."
        />
        {fe.note && <p className="text-xs font-medium text-red-500">{fe.note}</p>}
      </div>

      <div className="flex gap-3">
        <SubmitButton />
        <Button asChild variant="outline">
          <Link href="/acompanhamento">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

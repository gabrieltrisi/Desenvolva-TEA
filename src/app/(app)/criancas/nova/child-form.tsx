"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createChildAction, type ChildFormState } from "@/lib/children/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar criança"}
    </Button>
  );
}

export function ChildForm() {
  const [state, formAction] = useActionState<ChildFormState, FormData>(
    createChildAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Input id="name" name="name" label="Nome completo" required />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          label="Data de nascimento"
          required
        />
        <div className="space-y-1.5">
          <label
            htmlFor="supportLevel"
            className="block text-sm font-semibold text-foreground"
          >
            Nível de suporte (opcional)
          </label>
          <select
            id="supportLevel"
            name="supportLevel"
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground focus:border-trust-400"
            defaultValue=""
          >
            <option value="">Não informado</option>
            <option value="1">Nível 1</option>
            <option value="2">Nível 2</option>
            <option value="3">Nível 3</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="diagnosisNote"
          className="block text-sm font-semibold text-foreground"
        >
          Observações (opcional)
        </label>
        <textarea
          id="diagnosisNote"
          name="diagnosisNote"
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-slate-400 focus:border-trust-400"
          placeholder="Informações relevantes sobre o diagnóstico e o acompanhamento."
        />
      </div>

      <div className="flex gap-3">
        <SubmitButton />
        <Button asChild variant="outline">
          <Link href="/criancas">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

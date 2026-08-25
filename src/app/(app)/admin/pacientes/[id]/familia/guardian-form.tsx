"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  linkGuardianAction,
  type AdminActionState,
} from "@/lib/admin/actions";

export interface GuardianOption {
  id: string;
  name: string;
  email: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: "MOTHER", label: "Mãe" },
  { value: "FATHER", label: "Pai" },
  { value: "GUARDIAN", label: "Responsável legal" },
  { value: "OTHER", label: "Outro" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Vinculando..." : "Vincular responsável"}
    </Button>
  );
}

export function GuardianForm({
  childId,
  options,
}: {
  childId: string;
  options: GuardianOption[];
}) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    linkGuardianAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="childId" value={childId} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Responsável vinculado.
        </div>
      )}

      {options.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhum usuário com perfil Família disponível nesta organização.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            <label
              htmlFor="guardianUserId"
              className="block text-sm font-semibold text-foreground"
            >
              Usuário (perfil Família)
            </label>
            <select
              id="guardianUserId"
              name="guardianUserId"
              required
              defaultValue=""
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground focus:border-trust-400"
            >
              <option value="" disabled>
                Selecione um responsável
              </option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="relationship"
              className="block text-sm font-semibold text-foreground"
            >
              Parentesco
            </label>
            <select
              id="relationship"
              name="relationship"
              defaultValue="GUARDIAN"
              className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground focus:border-trust-400"
            >
              {RELATIONSHIP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="mainResponsible"
              className="h-4 w-4 rounded border-border"
            />
            Definir como responsável principal
          </label>

          <SubmitButton />
        </>
      )}
    </form>
  );
}

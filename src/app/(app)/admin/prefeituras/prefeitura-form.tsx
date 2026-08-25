"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createMunicipalityAction,
  type AdminActionState,
} from "@/lib/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Cadastrar prefeitura"}
    </Button>
  );
}

export function PrefeituraForm() {
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    createMunicipalityAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o formulário após cadastro bem-sucedido.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Prefeitura cadastrada com sucesso.
        </div>
      )}

      <Input id="name" name="name" label="Nome da prefeitura" required />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input id="city" name="city" label="Cidade" required />
        </div>
        <Input
          id="state"
          name="state"
          label="UF"
          maxLength={2}
          placeholder="BA"
          required
        />
      </div>

      <Input id="cnpj" name="cnpj" label="CNPJ (opcional)" />

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked
          className="h-4 w-4 rounded border-border"
        />
        Ativa
      </label>

      <SubmitButton />
    </form>
  );
}

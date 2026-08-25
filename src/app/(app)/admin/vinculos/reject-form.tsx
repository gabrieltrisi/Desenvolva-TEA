"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  rejectChildLinkAction,
  type AdminActionState,
} from "@/lib/admin/actions";

function RejectSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" size="sm" disabled={pending}>
      {pending ? "Rejeitando..." : "Confirmar rejeição"}
    </Button>
  );
}

export function RejectForm({ linkId }: { linkId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AdminActionState, FormData>(
    rejectChildLinkAction,
    {},
  );

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Rejeitar
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={linkId} />
      <textarea
        name="reason"
        rows={2}
        required
        placeholder="Motivo da rejeição (obrigatório)"
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-trust-400"
      />
      {state.error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <RejectSubmit />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

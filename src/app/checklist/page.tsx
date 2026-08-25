import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ChecklistForm } from "./checklist-form";

export const metadata: Metadata = {
  title: "Checklist de sinais de TEA | Desenvolva TEA",
  description:
    "Ferramenta informativa para familiares e cuidadores observarem possíveis sinais relacionados ao TEA. Não substitui avaliação médica.",
  alternates: { canonical: "/checklist" },
};

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-cream text-foreground">
      {/* Header público */}
      <header className="sticky top-0 z-20 border-b border-border bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Início
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <ChecklistForm />
      </main>

      <footer className="border-t border-border bg-cream">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-xs text-slate-500">
          Saúde · Educação · Inclusão — © {new Date().getFullYear()} Desenvolva TEA
        </div>
      </footer>
    </div>
  );
}

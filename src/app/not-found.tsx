import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-trust-50 px-4 text-center">
      <Logo size="lg" className="mb-10" />

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Compass className="h-8 w-8" />
      </span>

      <p className="mt-6 text-6xl font-extrabold tracking-tight text-brand-500">
        404
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-slate-500">
        A página que você procura não existe, foi movida ou o endereço está
        incorreto.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white shadow-sm hover:bg-brand-600"
      >
        <ArrowLeft className="h-5 w-5" /> Voltar ao início
      </Link>
    </main>
  );
}

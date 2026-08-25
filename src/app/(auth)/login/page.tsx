import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Painel ilustrativo (esconde no mobile) */}
      <section className="relative hidden flex-col justify-between bg-brand-600 p-12 text-white lg:flex">
        <Logo size="md" inverted />
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            Cada criança no seu tempo, com apoio em cada passo.
          </h2>
          <p className="max-w-md text-brand-50/90">
            Acompanhe trilhas de aprendizagem, registre a evolução e conecte
            família e profissionais em um só lugar.
          </p>
        </div>
        <p className="text-sm text-brand-50/70">
          Saúde · Educação · Inclusão
        </p>
      </section>

      {/* Formulário */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <h1 className="text-2xl font-extrabold text-foreground">
            Bem-vindo de volta 👋
          </h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Entre com suas credenciais para acessar a plataforma.
          </p>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

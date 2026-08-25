import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canCreateChild } from "@/lib/auth/routes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChildForm } from "./child-form";

export const metadata: Metadata = { title: "Nova criança" };

export default async function NovaCriancaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Defesa em profundidade: só ADMIN e PREFEITURA criam crianças.
  if (!canCreateChild(session.role)) redirect("/criancas");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Cadastrar criança"
        description="Preencha os dados básicos para iniciar o acompanhamento."
      />
      <Card>
        <ChildForm />
      </Card>
    </div>
  );
}

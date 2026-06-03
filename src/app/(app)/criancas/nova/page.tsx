import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ChildForm } from "./child-form";

export const metadata: Metadata = { title: "Nova criança" };

export default function NovaCriancaPage() {
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

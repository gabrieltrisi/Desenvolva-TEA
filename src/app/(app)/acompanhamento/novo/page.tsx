import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getAccessibleChildren } from "@/lib/evolution/access";
import { canCreateChild } from "@/lib/auth/routes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EvolutionForm } from "./evolution-form";

export const metadata: Metadata = { title: "Novo registro" };

export default async function NovoRegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const children = await getAccessibleChildren(session);
  const canCreate = canCreateChild(session.role);

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Baby}
        title="Nenhuma criança disponível"
        description={
          canCreate
            ? "Cadastre uma criança antes de registrar a evolução."
            : "Nenhuma criança vinculada ao seu perfil ainda."
        }
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/criancas/nova">Cadastrar criança</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  const { childId } = await searchParams;
  const defaultChildId =
    childId && children.some((c) => c.id === childId) ? childId : children[0].id;
  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Novo registro de evolução"
        description="Registre como foi o dia da criança. As notas alimentam o painel automaticamente."
      />
      <Card>
        <EvolutionForm
          kids={children.map((c) => ({ id: c.id, name: c.name }))}
          defaultChildId={defaultChildId}
          defaultDate={defaultDate}
        />
      </Card>
    </div>
  );
}

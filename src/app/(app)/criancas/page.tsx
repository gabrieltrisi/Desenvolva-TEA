import type { Metadata } from "next";
import Link from "next/link";
import { Baby, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { calcAge } from "@/lib/utils";

export const metadata: Metadata = { title: "Crianças" };

const SUPPORT_LABEL: Record<number, string> = {
  1: "Nível 1",
  2: "Nível 2",
  3: "Nível 3",
};

export default async function CriancasPage() {
  const session = await getSession();
  if (!session) return null;

  const children = await prisma.child.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
    include: { _count: { select: { enrollments: true, progress: true } } },
  });

  return (
    <>
      <PageHeader
        title="Crianças"
        description="Crianças acompanhadas na plataforma."
        action={
          <Button asChild>
            <Link href="/criancas/nova">
              <Plus className="h-4 w-4" /> Nova criança
            </Link>
          </Button>
        }
      />

      {children.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Nenhuma criança cadastrada"
          description="Cadastre a primeira criança para começar o acompanhamento."
          action={
            <Button asChild>
              <Link href="/criancas/nova">
                <Plus className="h-4 w-4" /> Cadastrar criança
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={child.name}
                  color={child.avatarColor}
                  className="h-12 w-12 text-base"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    {child.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {calcAge(child.birthDate)} anos
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {child.supportLevel && (
                  <Badge tone="warm">{SUPPORT_LABEL[child.supportLevel]}</Badge>
                )}
                <Badge tone="trust">{child._count.enrollments} trilhas</Badge>
                <Badge tone="brand">{child._count.progress} registros</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

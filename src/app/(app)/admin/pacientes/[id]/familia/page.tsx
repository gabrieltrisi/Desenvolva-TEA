import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  deactivateGuardianLinkAction,
  setMainResponsibleAction,
} from "@/lib/admin/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { GuardianForm } from "./guardian-form";

export const metadata: Metadata = { title: "Família do paciente" };

const RELATIONSHIP_LABELS: Record<string, string> = {
  MOTHER: "Mãe",
  FATHER: "Pai",
  GUARDIAN: "Responsável legal",
  OTHER: "Outro",
};

export default async function FamiliaPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  // Isolamento por organização (admin global dentro da própria org).
  const child = await prisma.child.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { id: true, name: true, avatarColor: true, mainResponsibleId: true },
  });
  if (!child) notFound();

  const [links, familyUsers] = await Promise.all([
    prisma.childGuardianLink.findMany({
      where: { childId: child.id },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: { guardian: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, role: "FAMILIA" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Família do paciente"
        description="Gerencie os responsáveis vinculados ao paciente."
      />

      <div className="mb-6 flex items-center gap-3">
        <Avatar name={child.name} color={child.avatarColor} />
        <p className="text-lg font-bold text-foreground">{child.name}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle className="mb-4">
            Responsáveis vinculados ({links.length})
          </CardTitle>

          {links.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum responsável vinculado"
              description="Use o formulário ao lado para vincular um responsável."
            />
          ) : (
            <ul className="divide-y divide-border">
              {links.map((link) => {
                const isMain = child.mainResponsibleId === link.guardianUserId;
                const isActive = link.status === "ACTIVE";
                return (
                  <li key={link.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar
                      name={link.guardian.name}
                      className="h-9 w-9 text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {link.guardian.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {link.guardian.email}
                      </p>
                    </div>
                    <Badge tone="trust">
                      {RELATIONSHIP_LABELS[link.relationship] ??
                        link.relationship}
                    </Badge>
                    <Badge tone={isActive ? "success" : "neutral"}>
                      {isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    {isMain && <Badge tone="brand">Principal</Badge>}

                    <div className="flex gap-2">
                      {isActive && !isMain && (
                        <form action={setMainResponsibleAction}>
                          <input type="hidden" name="childId" value={child.id} />
                          <input
                            type="hidden"
                            name="guardianUserId"
                            value={link.guardianUserId}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            Tornar principal
                          </Button>
                        </form>
                      )}
                      {isActive && (
                        <form action={deactivateGuardianLinkAction}>
                          <input type="hidden" name="id" value={link.id} />
                          <input type="hidden" name="childId" value={child.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Desativar
                          </Button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Vincular responsável</CardTitle>
          <GuardianForm childId={child.id} options={familyUsers} />
        </Card>
      </div>
    </>
  );
}

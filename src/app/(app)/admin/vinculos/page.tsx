import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { approveChildLinkAction } from "@/lib/admin/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { RejectForm } from "./reject-form";

export const metadata: Metadata = { title: "Vínculos pendentes" };

function supportLabel(level: number | null): string {
  return level ? `Nível ${level}` : "—";
}

export default async function VinculosPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  // Apenas vínculos PENDING de crianças da organização do admin.
  const links = await prisma.childMunicipalityLink.findMany({
    where: {
      status: "PENDING",
      child: { organizationId: session.organizationId },
    },
    orderBy: { requestedAt: "asc" },
    include: {
      child: {
        select: { name: true, avatarColor: true, supportLevel: true },
      },
      municipality: { select: { name: true, city: true, state: true } },
      requestedBy: { select: { name: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Vínculos pendentes"
        description="Aprove ou rejeite solicitações de vínculo de pacientes às prefeituras."
      />

      <Card>
        <CardTitle className="mb-4">
          Solicitações aguardando análise ({links.length})
        </CardTitle>

        {links.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Nenhum vínculo pendente"
            description="Novas solicitações de vínculo aparecerão aqui para aprovação."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 font-semibold">Paciente</th>
                  <th className="pb-3 font-semibold">Nível TEA</th>
                  <th className="pb-3 font-semibold">Prefeitura</th>
                  <th className="pb-3 font-semibold">Solicitado por</th>
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {links.map((link) => (
                  <tr key={link.id} className="align-top">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={link.child.name}
                          color={link.child.avatarColor}
                          className="h-8 w-8 text-xs"
                        />
                        <span className="font-semibold text-foreground">
                          {link.child.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge tone="warm">
                        {supportLabel(link.child.supportLevel)}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-600">
                      {link.municipality.name}
                      <span className="block text-xs text-slate-400">
                        {link.municipality.city}/{link.municipality.state}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {link.requestedBy.name}
                    </td>
                    <td className="py-3 text-slate-600">
                      {link.requestedAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col items-end gap-2">
                        <form action={approveChildLinkAction}>
                          <input type="hidden" name="id" value={link.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Aprovar
                          </Button>
                        </form>
                        <RejectForm linkId={link.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

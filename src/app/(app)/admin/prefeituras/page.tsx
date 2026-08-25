import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { setMunicipalityActiveAction } from "@/lib/admin/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PrefeituraForm } from "./prefeitura-form";

export const metadata: Metadata = { title: "Prefeituras" };

export default async function PrefeiturasPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const municipalities = await prisma.municipality.findMany({
    where: { organizationId: session.organizationId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { childLinks: { where: { status: "APPROVED" } }, users: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Prefeituras"
        description="Cadastro e gestão dos municípios atendidos pela organização."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardTitle className="mb-4">Nova prefeitura</CardTitle>
          <PrefeituraForm />
        </Card>

        <Card>
          <CardTitle className="mb-4">
            Prefeituras cadastradas ({municipalities.length})
          </CardTitle>

          {municipalities.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhuma prefeitura cadastrada"
              description="Cadastre a primeira prefeitura no formulário ao lado."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 font-semibold">Prefeitura</th>
                    <th className="pb-3 font-semibold">Pacientes</th>
                    <th className="pb-3 font-semibold">Usuários</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {municipalities.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3">
                        <p className="font-semibold text-foreground">{m.name}</p>
                        <p className="text-xs text-slate-500">
                          {m.city}/{m.state}
                          {m.cnpj ? ` · ${m.cnpj}` : ""}
                        </p>
                      </td>
                      <td className="py-3 text-slate-600">
                        {m._count.childLinks}
                      </td>
                      <td className="py-3 text-slate-600">{m._count.users}</td>
                      <td className="py-3">
                        <Badge tone={m.active ? "success" : "neutral"}>
                          {m.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <form
                          action={setMunicipalityActiveAction}
                          className="inline"
                        >
                          <input type="hidden" name="id" value={m.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={m.active ? "false" : "true"}
                          />
                          <Button
                            type="submit"
                            variant={m.active ? "outline" : "secondary"}
                            size="sm"
                          >
                            {m.active ? "Desativar" : "Ativar"}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

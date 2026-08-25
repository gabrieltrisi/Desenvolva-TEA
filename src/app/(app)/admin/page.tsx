import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Baby,
  Route,
  BookOpen,
  Video,
  Building2,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Defesa em profundidade: somente ADMIN acessa.
  if (session.role !== "ADMIN") redirect("/dashboard");

  const organizationId = session.organizationId;
  const [
    org,
    usersCount,
    childrenCount,
    tracksCount,
    contentsCount,
    users,
    municipalitiesCount,
    pendingLinksCount,
  ] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    prisma.user.count({ where: { organizationId } }),
    prisma.child.count({ where: { organizationId } }),
    prisma.learningTrack.count({ where: { organizationId } }),
    prisma.content.count({ where: { organizationId } }),
    prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.municipality.count({ where: { organizationId } }),
    prisma.childMunicipalityLink.count({
      where: { status: "PENDING", child: { organizationId } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Administração"
        description={`Organização: ${org?.name ?? "—"}`}
        action={
          <Button asChild variant="outline">
            <Link href="/admin/videos">
              <Video className="h-4 w-4" />
              Gerenciar vídeos
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Usuários" value={usersCount} />
        <StatCard icon={Baby} label="Crianças" value={childrenCount} />
        <StatCard icon={Route} label="Trilhas" value={tracksCount} />
        <StatCard icon={BookOpen} label="Conteúdos" value={contentsCount} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/prefeituras" className="group">
          <Card className="flex h-full items-center gap-4 transition-colors hover:bg-surface-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-foreground">Prefeituras</p>
              <p className="text-xs text-slate-500">
                {municipalitiesCount} cadastrada(s)
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
          </Card>
        </Link>

        <Link href="/admin/vinculos" className="group">
          <Card className="flex h-full items-center gap-4 transition-colors hover:bg-surface-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-100 text-warm-500">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-foreground">Vínculos pendentes</p>
              <p className="text-xs text-slate-500">
                {pendingLinksCount} aguardando aprovação
              </p>
            </div>
            {pendingLinksCount > 0 && (
              <Badge tone="warm">{pendingLinksCount}</Badge>
            )}
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
          </Card>
        </Link>

        <Link href="/admin/videos" className="group">
          <Card className="flex h-full items-center gap-4 transition-colors hover:bg-surface-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Video className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-foreground">Vídeos</p>
              <p className="text-xs text-slate-500">Biblioteca terapêutica</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
          </Card>
        </Link>
      </div>

      <Card className="mt-6">
        <CardTitle className="mb-4">Usuários da organização</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 font-semibold">Usuário</th>
                <th className="pb-3 font-semibold">Perfil</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} className="h-9 w-9 text-xs" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge tone="trust">{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge tone={user.active ? "success" : "neutral"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

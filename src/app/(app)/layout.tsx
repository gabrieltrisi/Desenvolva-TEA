import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import type { Role } from "@/generated/prisma/enums";

const PANEL_TITLE: Record<Role, string> = {
  FAMILIA: "Painel da Família",
  PROFISSIONAL: "Painel do Profissional",
  ADMIN: "Painel Administrativo",
  PREFEITURA: "Painel da Prefeitura",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AppShell role={session.role} title={PANEL_TITLE[session.role]}>
      {children}
    </AppShell>
  );
}

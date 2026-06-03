"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, X } from "lucide-react";
import { navForRole } from "@/lib/auth/rbac";
import type { Role } from "@/generated/prisma/enums";
import { logoutAction } from "@/lib/auth/actions";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  open,
  onClose,
}: {
  role: Role;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-20 flex-col items-center border-r border-border bg-surface py-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <Link href="/dashboard" aria-label="Desenvolva TEA — início">
          <LogoMark size="lg" />
        </Link>

        <button
          onClick={onClose}
          className="mt-3 rounded-lg p-1 text-slate-400 hover:bg-surface-muted lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Navegação */}
        <nav className="mt-6 flex flex-1 flex-col items-center gap-2">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-400 hover:bg-surface-muted hover:text-slate-600",
                )}
              >
                <Icon className="h-[22px] w-[22px]" />
              </Link>
            );
          })}
        </nav>

        {/* Rodapé: configurações + sair */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            title="Configurações"
            aria-label="Configurações"
            className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:bg-surface-muted hover:text-slate-600"
          >
            <Settings className="h-[22px] w-[22px]" />
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              aria-label="Sair"
              className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-[22px] w-[22px]" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

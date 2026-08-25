"use client";

import Link from "next/link";
import { Menu, Search, Bell, Plus } from "lucide-react";

export function Topbar({
  title,
  onOpenMenu,
}: {
  title: string;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:px-8">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-surface-muted lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-extrabold leading-tight text-trust-700">
        {title}
      </h1>

      {/* Busca (visual) */}
      <div className="relative ml-auto hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Buscar recursos, profissionais..."
          className="h-10 w-full rounded-full border border-border bg-surface-muted pl-9 pr-4 text-sm text-foreground placeholder:text-slate-400 focus:border-trust-400 focus:bg-surface"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-surface-muted"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warm-500" />
        </button>

        <Link
          href="/acompanhamento/novo"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-muted"
        >
          <Plus className="h-4 w-4" /> Registro
        </Link>
      </div>
    </header>
  );
}

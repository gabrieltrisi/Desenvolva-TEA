"use client";

import { Moon, Eye, Contrast, Type } from "lucide-react";

// Barra de acessibilidade — visual por enquanto (comportamento será implementado depois).
const TOGGLES = [
  { label: "Escurecer", icon: Moon },
  { label: "Modo Sensorial", icon: Eye },
  { label: "Contraste", icon: Contrast },
  { label: "Texto+", icon: Type },
];

export function AccessibilityBar() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto bg-trust-700 px-4 py-2 lg:px-8">
      <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-wide text-trust-100/80">
        Acessibilidade
      </span>
      {TOGGLES.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          title={`${label} (em breve)`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

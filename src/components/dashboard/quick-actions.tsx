import Link from "next/link";
import { Video, Target, BookOpen, BarChart3, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Action {
  title: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export function QuickActions({ childId }: { childId?: string }) {
  const ACTIONS: Action[] = [
    { title: "Nova Consulta", hint: "Agendar sessão", href: "/criancas", icon: Video, color: "#3a6fe0" },
    { title: "Atividade do Dia", hint: "3 pendentes", href: "/trilhas", icon: Target, color: "#ef5b6b" },
    { title: "Materiais", hint: "Novos guias", href: "/conteudos", icon: BookOpen, color: "#1cab88" },
    {
      title: "Relatório",
      hint: "Gerar PDF",
      href: childId ? `/relatorios/crianca/${childId}` : "/relatorios",
      icon: BarChart3,
      color: "#9b5bef",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link key={a.title} href={a.href}>
            <Card className="flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${a.color}1a`, color: a.color }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold text-foreground">{a.title}</span>
              <span className="text-xs text-slate-400">{a.hint}</span>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

import { BadgeCheck, CalendarClock, Trophy } from "lucide-react";

function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-white/12 px-4 py-3 text-center backdrop-blur">
      <p className="text-2xl font-extrabold leading-tight text-white">{value}</p>
      <p className="text-[11px] font-medium text-white/75">{label}</p>
    </div>
  );
}

export function HeroCard({
  name,
  age,
  supportLevel,
  accompaniedYears,
  therapistName,
  planActive,
  nextSessionLabel,
  weeklyXp,
  overallEvolution,
  sessionsCount,
  achievementsCount,
}: {
  name: string;
  age: number;
  supportLevel: number | null;
  accompaniedYears: number | null;
  therapistName: string | null;
  planActive: boolean;
  nextSessionLabel: string | null;
  weeklyXp: number;
  overallEvolution: number;
  sessionsCount: number;
  achievementsCount: number;
}) {
  const subtitleParts = [
    supportLevel ? `TEA Nível ${supportLevel}` : null,
    accompaniedYears != null
      ? `Em acompanhamento há ${accompaniedYears} ${accompaniedYears === 1 ? "ano" : "anos"}`
      : null,
    therapistName ? `Terapeuta: ${therapistName}` : null,
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-trust-600 via-trust-500 to-brand-400 p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur">
            🧒
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold leading-tight text-white">
              {name}, {age} anos
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {subtitleParts.join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {planActive && (
                <Pill icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                  Plano Ativo
                </Pill>
              )}
              {nextSessionLabel && (
                <Pill icon={<CalendarClock className="h-3.5 w-3.5" />}>
                  Sessão {nextSessionLabel}
                </Pill>
              )}
              <Pill icon={<Trophy className="h-3.5 w-3.5" />}>
                {weeklyXp} XP esta semana
              </Pill>
            </div>
          </div>
        </div>

        <div className="flex gap-3 lg:w-80">
          <Stat value={`${overallEvolution}%`} label="Evolução Geral" />
          <Stat value={String(sessionsCount)} label="Sessões" />
          <Stat value={String(achievementsCount)} label="Conquistas" />
        </div>
      </div>
    </div>
  );
}

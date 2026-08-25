"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Brain,
  Apple,
  Hand,
  HeartHandshake,
  Speech,
  type LucideIcon,
} from "lucide-react";
import type { ContentSpecialty } from "@/generated/prisma/enums";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyVideoPlayer } from "@/components/video/lazy-video-player";

export interface SpecialtyVideo {
  id: string;
  title: string;
  summary: string;
}

export interface SpecialtyGroup {
  key: ContentSpecialty;
  label: string;
  videos: SpecialtyVideo[];
}

/** Ícone + descrição curta por especialidade (apresentação dos módulos). */
const META: Record<ContentSpecialty, { icon: LucideIcon; desc: string }> = {
  FONOAUDIOLOGIA: { icon: Speech, desc: "Comunicação, linguagem e fala." },
  NEUROLOGIA: { icon: Brain, desc: "Desenvolvimento neurológico e cognitivo." },
  NUTRICAO: { icon: Apple, desc: "Alimentação e aceitação alimentar." },
  PSICOLOGIA: { icon: HeartHandshake, desc: "Comportamento, emoções e vínculo." },
  TERAPIA_OCUPACIONAL: { icon: Hand, desc: "Autonomia e funcionalidade no dia a dia." },
};

/**
 * "Vídeos por especialidade" como módulos clicáveis:
 * a tela inicial mostra só os cards das especialidades; ao clicar em uma,
 * exibe apenas os vídeos dela + botão de voltar. Os dados vêm prontos do
 * server component; aqui é só a seleção (estado client-side).
 */
export function SpecialtyVideoExplorer({ groups }: { groups: SpecialtyGroup[] }) {
  const [selected, setSelected] = useState<ContentSpecialty | null>(null);
  const active = groups.find((g) => g.key === selected) ?? null;

  return (
    <section className="mt-10">
      {active === null ? (
        <>
          <h2 className="text-lg font-bold text-foreground">
            Vídeos por especialidade
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma área terapêutica para ver os vídeos.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => {
              const { icon: Icon, desc } = META[g.key];
              const has = g.videos.length > 0;
              return (
                <Card key={g.key} className="flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-trust-50 text-trust-500">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge tone={has ? "trust" : "neutral"}>
                      {has ? `${g.videos.length} vídeo(s)` : "Em breve"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{g.label}</CardTitle>
                  <CardDescription className="mt-1 flex-1">{desc}</CardDescription>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    variant={has ? "primary" : "outline"}
                    disabled={!has}
                    onClick={() => setSelected(g.key)}
                  >
                    Ver vídeos
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-trust-50 text-trust-500">
                {(() => {
                  const Icon = META[active.key].icon;
                  return <Icon className="h-4 w-4" />;
                })()}
              </span>
              <h2 className="text-lg font-bold text-foreground">{active.label}</h2>
              <Badge tone="trust">{active.videos.length} vídeo(s)</Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para especialidades
            </Button>
          </div>

          {active.videos.length === 0 ? (
            <Card className="mt-4">
              <CardDescription>
                Nenhum vídeo publicado nesta especialidade ainda.
              </CardDescription>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.videos.map((v) => (
                <Card key={v.id} className="flex flex-col">
                  <LazyVideoPlayer contentId={v.id} />
                  <CardTitle className="mt-3 text-base">{v.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 flex-1">
                    {v.summary}
                  </CardDescription>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

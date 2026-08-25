"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { VideoPlayer } from "./video-player";

/**
 * Mostra um cartão com botão de play e só resolve a URL assinada (presigned GET)
 * quando o usuário clica. Evita N requisições de reprodução no carregamento da
 * biblioteca pública e reduz banda do bucket.
 */
export function LazyVideoPlayer({ contentId }: { contentId: string }) {
  const [active, setActive] = useState(false);

  if (active) return <VideoPlayer contentId={contentId} autoPlay />;

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label="Reproduzir vídeo"
      className="group flex aspect-video w-full items-center justify-center rounded-xl bg-slate-900 transition-colors hover:bg-slate-800"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-trust-600 shadow-lg transition-transform group-hover:scale-110">
        <Play className="h-6 w-6 translate-x-0.5 fill-current" />
      </span>
    </button>
  );
}

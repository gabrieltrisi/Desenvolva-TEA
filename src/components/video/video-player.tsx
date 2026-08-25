"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Player que resolve a URL assinada (presigned GET) sob demanda a partir do
 * endpoint autenticado, e a injeta no <video>. A URL tem TTL curto e nunca é
 * exposta no HTML do servidor.
 */
export function VideoPlayer({
  contentId,
  autoPlay = false,
}: {
  contentId: string;
  autoPlay?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/videos/${contentId}/playback-url`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Não foi possível carregar o vídeo.");
        }
        const { url } = (await res.json()) as { url: string };
        if (active && videoRef.current) videoRef.current.src = url;
      } catch (err) {
        if (active && (err as Error).name !== "AbortError")
          setError((err as Error).message);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [contentId]);

  if (error)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );

  return (
    <video
      ref={videoRef}
      controls
      autoPlay={autoPlay}
      preload="metadata"
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}

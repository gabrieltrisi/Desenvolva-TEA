"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CONTENT_SPECIALTIES, CONTENT_SPECIALTY_LABELS } from "@/lib/labels";
import {
  MAX_VIDEO_BYTES,
  humanMaxSize,
  isAllowedVideoMime,
} from "@/lib/videos/validation";

type Phase = "idle" | "signing" | "uploading" | "finalizing" | "done";

interface UploadSignature {
  contentId: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
}

/** Envia o arquivo direto ao Cloudinary (signed upload), com progresso real. */
function uploadToCloudinary(
  sig: UploadSignature,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);
    fd.append("public_id", sig.publicId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", sig.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `Falha no upload ao Cloudinary (HTTP ${xhr.status}).`;
      try {
        const j = JSON.parse(xhr.responseText);
        if (j?.error?.message) msg = j.error.message;
      } catch {
        // mantém a mensagem padrão
      }
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Erro de rede durante o upload."));
    xhr.send(fd);
  });
}

export function VideoUploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const busy = phase !== "idle" && phase !== "done";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const summary = String(data.get("summary") ?? "").trim();
    const specialty = String(data.get("specialty") ?? "");
    const publish = data.get("publish") === "on";
    const file = fileRef.current?.files?.[0];

    if (!title || !summary) return setError("Informe título e descrição.");
    if (!specialty) return setError("Selecione a especialidade.");
    if (!file) return setError("Selecione um arquivo de vídeo.");
    if (!isAllowedVideoMime(file.type))
      return setError("Formato não suportado. Envie um arquivo .mp4.");
    if (file.size > MAX_VIDEO_BYTES)
      return setError(`Arquivo excede o limite de ${humanMaxSize()}.`);

    try {
      setPhase("signing");
      const sigRes = await fetch("/api/admin/videos/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, specialty }),
      });
      if (!sigRes.ok) {
        const d = (await sigRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(d?.error ?? "Falha ao preparar o upload.");
      }
      const sig = (await sigRes.json()) as UploadSignature;

      setPhase("uploading");
      setProgress(0);
      await uploadToCloudinary(sig, file, setProgress);

      setPhase("finalizing");
      const finRes = await fetch("/api/admin/videos/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: sig.contentId, publish }),
      });
      if (!finRes.ok) {
        const d = (await finRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(d?.error ?? "Falha ao finalizar o vídeo.");
      }

      setPhase("done");
      router.push("/admin/videos");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPhase("idle");
    }
  }

  const label =
    phase === "signing"
      ? "Preparando..."
      : phase === "uploading"
        ? `Enviando... ${progress}%`
        : phase === "finalizing"
          ? "Finalizando..."
          : phase === "done"
            ? "Concluído!"
            : "Enviar vídeo";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Input id="title" name="title" label="Título" required disabled={busy} />

      <div className="space-y-1.5">
        <label htmlFor="summary" className="block text-sm font-semibold text-foreground">
          Descrição
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          required
          disabled={busy}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-slate-400 focus:border-trust-400 disabled:opacity-50"
          placeholder="Breve descrição do vídeo terapêutico."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="specialty" className="block text-sm font-semibold text-foreground">
          Especialidade
        </label>
        <select
          id="specialty"
          name="specialty"
          defaultValue=""
          required
          disabled={busy}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground focus:border-trust-400 disabled:opacity-50"
        >
          <option value="" disabled>
            Selecione...
          </option>
          {CONTENT_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {CONTENT_SPECIALTY_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="file" className="block text-sm font-semibold text-foreground">
          Arquivo de vídeo (.mp4, até {humanMaxSize()})
        </label>
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          accept="video/mp4"
          required
          disabled={busy}
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-trust-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-trust-600 hover:file:bg-trust-100 disabled:opacity-50"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="publish"
          defaultChecked
          disabled={busy}
          className="h-4 w-4 rounded border-border"
        />
        Publicar imediatamente
        <span className="text-xs text-slate-500">
          (desmarque para vídeos com dados sensíveis — LGPD)
        </span>
      </label>

      {phase === "uploading" && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-trust-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          <UploadCloud className="h-4 w-4" />
          {label}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/videos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

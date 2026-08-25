import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CloudOff } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { canManageVideos } from "@/lib/auth/rbac";
import { isCloudinaryConfigured } from "@/lib/storage/cloudinary";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { VideoUploadForm } from "./video-upload-form";

export const metadata: Metadata = { title: "Enviar vídeo" };

export default async function NovoVideoPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManageVideos(session.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Enviar vídeo terapêutico"
        description="O arquivo vai direto para o Cloudinary; nada trafega pelo banco de dados."
      />
      <Card>
        {isCloudinaryConfigured() ? (
          <VideoUploadForm />
        ) : (
          <EmptyState
            icon={CloudOff}
            title="Cloudinary não configurado"
            description="Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no .env e reinicie o servidor."
          />
        )}
      </Card>
    </div>
  );
}

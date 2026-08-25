import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas autenticadas — não devem ser indexadas (redirecionam ao login).
      disallow: [
        "/dashboard",
        "/criancas",
        "/acompanhamento",
        "/conteudos",
        "/trilhas",
        "/relatorios",
        "/municipio",
        "/admin",
        "/login",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

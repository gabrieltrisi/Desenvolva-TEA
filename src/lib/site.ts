/**
 * Configuração central do site — usada em metadata, SEO, robots, sitemap e
 * geração de imagens (Open Graph). O domínio de produção pode ser definido
 * via NEXT_PUBLIC_SITE_URL (recomendado no deploy); caso ausente, usa o padrão.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://desenvolvatea.com.br"
).replace(/\/$/, "");

export const SITE_NAME = "Desenvolva TEA";

export const SITE_TAGLINE =
  "Cada criança no seu tempo, com apoio em cada passo.";

export const SITE_DESCRIPTION =
  "Plataforma SaaS para acompanhamento do desenvolvimento de crianças com TEA, conectando famílias, profissionais e secretarias municipais de educação.";

export const SITE_KEYWORDS = [
  "TEA",
  "Transtorno do Espectro Autista",
  "autismo",
  "acompanhamento infantil",
  "desenvolvimento infantil",
  "educação inclusiva",
  "trilhas de aprendizagem",
  "relatórios terapêuticos",
  "secretaria de educação",
];

/** Razão social da controladora dos dados (uso legal/LGPD). */
export const LEGAL_ENTITY = "Desenvolva TEA Tecnologia Educacional LTDA";

/** E-mail oficial de contato (privacidade, encarregado/DPO, suporte). */
export const CONTACT_EMAIL = "contato@desenvolvatea.com.br";

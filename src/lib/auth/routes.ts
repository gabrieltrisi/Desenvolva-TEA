// Módulo edge-safe (sem dependências de Node nem de UI): pode ser importado
// pelo middleware (Edge) E por Server Components/Actions. Centraliza o
// role-gating de ROTAS — complementa os filtros de dados da Fase 3 impedindo
// acesso direto por URL a páginas não permitidas.
import { Role } from "@/generated/prisma/enums";

const ALL_ROLES: Role[] = [
  Role.ADMIN,
  Role.FAMILIA,
  Role.PROFISSIONAL,
  Role.PREFEITURA,
];

export interface RouteRule {
  /** Prefixo da rota. A rota casa se for igual ou começar com `${prefix}/`. */
  prefix: string;
  /** Perfis autorizados a acessar a rota. */
  roles: Role[];
}

/**
 * Regras ordenadas do MAIS específico para o mais genérico — a primeira que
 * casar vence. Rotas sem regra são liberadas (apenas exigem sessão, garantida
 * pelo middleware). Acesso por criança (ex.: /relatorios/crianca/[id]) é
 * permitido amplamente aqui mas continua protegido por `canAccessChild`.
 */
export const ROUTE_RULES: RouteRule[] = [
  { prefix: "/criancas/nova", roles: [Role.ADMIN, Role.PREFEITURA] },
  { prefix: "/criancas", roles: ALL_ROLES },
  { prefix: "/relatorios/municipio", roles: [Role.ADMIN, Role.PREFEITURA] },
  {
    prefix: "/relatorios/crianca",
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  { prefix: "/relatorios", roles: [Role.ADMIN, Role.PROFISSIONAL, Role.PREFEITURA] },
  { prefix: "/municipio", roles: [Role.ADMIN, Role.PREFEITURA] },
  {
    prefix: "/acompanhamento",
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  { prefix: "/admin", roles: [Role.ADMIN] },
  { prefix: "/dashboard", roles: ALL_ROLES },
  { prefix: "/trilhas", roles: ALL_ROLES },
  { prefix: "/conteudos", roles: ALL_ROLES },
];

/** Encontra a regra mais específica que casa com o pathname (ou null). */
export function matchRouteRule(pathname: string): RouteRule | null {
  return (
    ROUTE_RULES.find(
      (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
    ) ?? null
  );
}

/** Verifica se o perfil pode acessar a rota. Rotas sem regra são liberadas. */
export function canAccessRoute(role: Role, pathname: string): boolean {
  const rule = matchRouteRule(pathname);
  return rule ? rule.roles.includes(role) : true;
}

/** Criação de criança: restrita a ADMIN e PREFEITURA (decisão de produto). */
export function canCreateChild(role: Role): boolean {
  return role === Role.ADMIN || role === Role.PREFEITURA;
}

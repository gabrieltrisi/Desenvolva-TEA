import {
  LayoutDashboard,
  Baby,
  Route,
  BookOpen,
  LineChart,
  FileBarChart,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@/generated/prisma/enums";

/** Rótulos legíveis para cada perfil. */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  FAMILIA: "Família",
  PROFISSIONAL: "Profissional",
  PREFEITURA: "Prefeitura",
};

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[]; // perfis que enxergam o item
}

/** Navegação principal. A ordem reflete a barra lateral. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  {
    label: "Crianças",
    href: "/criancas",
    icon: Baby,
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL],
  },
  {
    label: "Trilhas",
    href: "/trilhas",
    icon: Route,
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  {
    label: "Conteúdos",
    href: "/conteudos",
    icon: BookOpen,
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  {
    label: "Acompanhamento",
    href: "/acompanhamento",
    icon: LineChart,
    roles: [Role.ADMIN, Role.FAMILIA, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: FileBarChart,
    roles: [Role.ADMIN, Role.PROFISSIONAL, Role.PREFEITURA],
  },
  {
    label: "Município",
    href: "/municipio",
    icon: Building2,
    roles: [Role.ADMIN, Role.PREFEITURA],
  },
  {
    label: "Administração",
    href: "/admin",
    icon: Settings,
    roles: [Role.ADMIN],
  },
];

/** Filtra os itens de navegação visíveis para um perfil. */
export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Verifica se um perfil pode acessar uma rota. */
export function canAccess(role: Role, href: string): boolean {
  const item = NAV_ITEMS.find((i) => href.startsWith(i.href));
  return item ? item.roles.includes(role) : true;
}

/** Acesso ao módulo executivo municipal (gestores públicos + admin). */
export function canViewMunicipio(role: Role): boolean {
  return role === Role.ADMIN || role === Role.PREFEITURA;
}

/** Upload e gestão de vídeos terapêuticos — restrito ao ADMIN. */
export function canManageVideos(role: Role): boolean {
  return role === Role.ADMIN;
}

# packages/ui

**Design system compartilhado (componentes React + Tailwind).**

> ⚠️ **Placeholder.** Os componentes de produção continuam em
> `src/components/`. Nada foi movido.

## Objetivo

Centralizar o design system humanizado do produto para ser consumido por
[`apps/web`](../../apps/web/README.md) (e por futuros clientes web):

- Componentes base: `Button`, `Card`, `Input`, `Badge`, `Avatar`, `StatCard`…
- Componentes de layout: `Sidebar`, `Topbar`, `AppShell`.
- Tokens/tema **Tailwind CSS v4** e utilitários (`clsx`, `tailwind-merge`).
- Ícones (`lucide-react`) e gráficos (`recharts`) padronizados.

## Convenções planejadas

- Componentes puros de apresentação, sem regra de negócio nem fetch de dados.
- Exportados como `@tea/ui`.

## Estado atual

Mapeia hoje: `src/components/ui/` e `src/components/layout/`.

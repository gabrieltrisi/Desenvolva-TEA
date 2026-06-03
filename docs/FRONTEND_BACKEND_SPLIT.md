# Separação Frontend + Backend — Plano

Documento-guia da migração de um app Next.js monolítico para uma arquitetura
**Frontend (Vercel) + Backend (Render)** em formato de monorepo.

> **Status atual:** apenas a **base de pastas** foi criada (`apps/`,
> `packages/`, `infra/`). **Nenhum código de produção foi movido.** O app
> Next.js continua 100% funcional em `src/` e nada de rotas, auth ou Prisma
> schema foi alterado.

## Por que separar

Hoje tudo roda no mesmo app Next.js: UI, regras de negócio, acesso ao banco e
autenticação. Separar permite:

- Escalar frontend e backend de forma independente.
- Deploy do frontend na **Vercel** (edge/CDN, ótimo para Next.js) e do backend
  na **Render** (processo Node de longa duração + PostgreSQL gerenciado).
- Reuso do backend por outros clientes futuros (mobile, integrações de
  prefeituras).

## Arquitetura-alvo

```
apps/
  web/        # Next.js (App Router) → Vercel. Só apresentação + chamadas à API.
  api/        # Backend HTTP (REST/RPC) → Render. Regras de negócio + dados.

packages/
  database/   # Prisma schema + client (@prisma/adapter-pg)
  domain/     # Regras de negócio + contratos zod (puro, sem framework)
  auth/       # Senha (bcrypt) + sessão JWT (jose) + RBAC
  ui/         # Design system (componentes React + Tailwind v4)
  config/     # tsconfig/eslint/env/site compartilhados

infra/
  render/     # Blueprint do backend (render.yaml) — futuro
  vercel/     # Config do frontend (vercel.json) — futuro
  docker/     # Compose/Dockerfiles — futuro
```

Fluxo: `apps/web` (browser/SSR) → HTTP → `apps/api` → `packages/domain` →
`packages/database` → PostgreSQL.

## Mapeamento do código atual → destino

| Hoje (`src/…`)                          | Destino futuro            |
| --------------------------------------- | ------------------------- |
| `src/app/(app)`, `src/app/(auth)`       | `apps/web`                |
| `src/components/ui`, `…/layout`         | `packages/ui`             |
| `src/app/api/*`                         | `apps/api`                |
| `src/lib/auth/*`, `src/proxy.ts`        | `packages/auth`           |
| `src/lib/children`, validações zod      | `packages/domain`         |
| `src/lib/prisma.ts`, `prisma/*`         | `packages/database`       |
| `src/lib/env.ts`, `site.ts`, configs    | `packages/config`         |

## Princípios desta etapa (segurança primeiro)

1. **Não mover** o app Next.js atual.
2. **Não quebrar** rotas existentes.
3. **Não trocar** autenticação.
4. **Não alterar** o Prisma schema sem necessidade.
5. **Não tocar** em `package.json`/workspaces se houver risco de quebrar o
   build atual — apenas documentar.

## Roadmap incremental (fases futuras)

> Cada fase deve manter o build verde e ser reversível.

1. **Fase 0 — Base (concluída).** Pastas + READMEs + docs. Sem mover código.
2. **Fase 1 — Extrair pacotes puros.** Mover `domain` e `config` (sem deps de
   framework) para `packages/`, ajustando paths de import. Só então habilitar
   workspaces no `package.json`.
3. **Fase 2 — `packages/database` e `packages/ui`.** Centralizar Prisma e
   design system; apps passam a importar `@tea/database` / `@tea/ui`.
4. **Fase 3 — `packages/auth`.** Reempacotar auth atual **sem trocar o
   mecanismo** (JWT httpOnly preservado).
5. **Fase 4 — `apps/api`.** Expor endpoints HTTP espelhando os server
   actions/route handlers de hoje. Ver [`API_ROADMAP.md`](./API_ROADMAP.md).
6. **Fase 5 — `apps/web` consome a API.** Trocar acesso direto ao banco por
   chamadas HTTP, atrás de feature flag, rota a rota.
7. **Fase 6 — Deploys separados.** Frontend na Vercel
   ([`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)), backend na Render
   ([`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md)).

## Sobre workspaces (npm)

Habilitar `"workspaces"` no `package.json` muda a resolução de módulos e **pode
quebrar o build atual** enquanto o código ainda vive em `src/`. Por isso, nesta
etapa **não** alteramos `package.json`. A ativação de workspaces fica para a
Fase 1, junto com a primeira extração real de pacote.

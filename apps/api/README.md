# apps/api

**Backend HTTP — destino futuro das regras de negócio e do acesso a dados.**

> ⚠️ **Placeholder.** Nada de código de produção foi movido para cá ainda.
> Hoje a lógica de servidor vive dentro do app Next.js (`src/app/api`,
> `src/lib`). Ver [`docs/API_ROADMAP.md`](../../docs/API_ROADMAP.md).

## Objetivo

Expor uma **API HTTP** (REST e/ou RPC) consumida por [`apps/web`](../web/README.md)
e por futuros clientes (app mobile, integrações de prefeituras). Deploy na
**Render**.

Responsabilidades previstas:

- Autenticação/sessão (login, refresh, logout) — usando
  [`packages/auth`](../../packages/auth/README.md).
- Endpoints de domínio (crianças, trilhas, conteúdos, acompanhamento,
  relatórios) — usando [`packages/domain`](../../packages/domain/README.md).
- Acesso ao banco via [`packages/database`](../../packages/database/README.md)
  (Prisma 7 + `@prisma/adapter-pg`).
- Healthchecks (`/health`, `/health/database`) para o load balancer da Render.

## O que **não** vai aqui

- Renderização de UI / componentes React (ficam em
  [`apps/web`](../web/README.md)).
- Definição do schema do banco (fica em
  [`packages/database`](../../packages/database/README.md)).

## Deploy

**Render** — ver [`docs/RENDER_DEPLOYMENT.md`](../../docs/RENDER_DEPLOYMENT.md)
e [`infra/render/`](../../infra/render/README.md).

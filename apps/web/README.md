# apps/web

**Frontend (Next.js) — destino futuro do app que hoje vive em `src/`.**

> ⚠️ **Placeholder.** Nada de código de produção foi movido para cá ainda.
> Esta pasta apenas reserva o lugar do frontend na arquitetura de monorepo
> planejada (ver [`docs/FRONTEND_BACKEND_SPLIT.md`](../../docs/FRONTEND_BACKEND_SPLIT.md)).

## Objetivo

Hospedar a aplicação **Next.js 16 (App Router)** voltada ao usuário final
(famílias, profissionais, prefeituras), com deploy na **Vercel**.

Quando a separação acontecer, este app:

- Consumirá a API HTTP exposta por [`apps/api`](../api/README.md) em vez de
  acessar o banco diretamente.
- Manterá apenas a camada de apresentação: páginas, componentes, layouts,
  estados de UI e chamadas ao backend.
- Importará design system de [`packages/ui`](../../packages/ui/README.md) e
  tipos/contratos de [`packages/domain`](../../packages/domain/README.md).

## O que **não** vai aqui

- Acesso direto ao banco (Prisma fica em [`packages/database`](../../packages/database/README.md)).
- Regras de negócio (vão para [`packages/domain`](../../packages/domain/README.md)).
- Emissão/validação de sessão server-side de baixo nível
  (vai para [`packages/auth`](../../packages/auth/README.md)).

## Deploy

**Vercel** — ver [`docs/VERCEL_DEPLOYMENT.md`](../../docs/VERCEL_DEPLOYMENT.md)
e [`infra/vercel/`](../../infra/vercel/README.md).

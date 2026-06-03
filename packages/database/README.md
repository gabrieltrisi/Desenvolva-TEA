# packages/database

**Camada de dados compartilhada — Prisma schema + client.**

> ⚠️ **Placeholder.** O schema e o client de produção continuam em
> `prisma/` e `src/lib/prisma.ts`. Nada foi movido.

## Objetivo

Centralizar tudo relacionado a persistência, para ser importado tanto por
[`apps/api`](../../apps/api/README.md) quanto por scripts/seed:

- `schema.prisma` (modelagem multi-tenant: `Organization`, usuários, crianças,
  trilhas, conteúdos, registros de evolução).
- Migrations (`prisma/migrations`).
- Singleton do **Prisma Client 7** com `@prisma/adapter-pg` (driver `pg`).
- Seed e dados de demonstração.

## Convenções planejadas

- Exportar um único client tipado (`@tea/database`).
- Nenhuma regra de negócio aqui — apenas acesso a dados. Regras vão para
  [`packages/domain`](../domain/README.md).
- `prisma generate` roda neste pacote e expõe os tipos para os demais.

## Estado atual

Mapeia o conteúdo de hoje em:

- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `prisma/demo.ts`
- `src/lib/prisma.ts` (singleton)
- `src/generated/` (client gerado)

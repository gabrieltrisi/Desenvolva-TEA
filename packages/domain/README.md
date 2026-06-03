# packages/domain

**Regras de negócio e contratos compartilhados (framework-agnostic).**

> ⚠️ **Placeholder.** A lógica de domínio de produção ainda vive em
> `src/lib/*` (ex.: `src/lib/children`, validações zod). Nada foi movido.

## Objetivo

Concentrar o **núcleo de negócio**, sem dependência de Next.js, React ou
Prisma Client concreto:

- Schemas de validação (**zod**) e tipos compartilhados entre frontend e backend.
- Casos de uso / serviços (ex.: cadastro de criança, registro de evolução,
  geração de relatório).
- Regras de perfil/permissão de alto nível (`ADMIN`, `FAMILIA`,
  `PROFISSIONAL`, `PREFEITURA`).
- Constantes e rótulos de domínio (`labels`).

## Por que separar

Esta camada é o **contrato comum**: [`apps/web`](../../apps/web/README.md) usa
os tipos para tipar chamadas à API, e [`apps/api`](../../apps/api/README.md)
usa os casos de uso para executar a lógica. Mantê-la pura facilita testes e
evita acoplar negócio a um framework.

## Estado atual

Mapeia hoje: `src/lib/children/`, validações em `src/lib/*`,
`src/lib/labels.ts`, `src/lib/utils.ts` e os enums/tipos derivados do schema.

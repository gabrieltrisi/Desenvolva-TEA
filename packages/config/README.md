# packages/config

**Configuração compartilhada (TypeScript, ESLint, env, constantes).**

> ⚠️ **Placeholder.** As configs de produção continuam na raiz
> (`tsconfig.json`, `eslint.config.mjs`, `src/lib/env.ts`, `src/lib/site.ts`).
> Nada foi movido.

## Objetivo

Evitar duplicação de configuração entre apps e pacotes do monorepo:

- Presets de **TypeScript** (`tsconfig.base.json`) estendidos por cada app/pacote.
- Preset de **ESLint** compartilhado.
- Validação de variáveis de ambiente (**zod**) — base do atual `src/lib/env.ts`.
- Configuração de marca/SEO (`site.ts`) e constantes globais.

## Convenções planejadas

- Exportado como `@tea/config`.
- Sem efeitos colaterais em import; apenas objetos/presets.

## Estado atual

Mapeia hoje: `tsconfig.json`, `eslint.config.mjs`, `src/lib/env.ts`,
`src/lib/site.ts`.

# Roadmap da API (Backend)

Planejamento dos endpoints do futuro [`apps/api`](../apps/api/README.md),
extraídos da lógica de servidor que hoje vive no app Next.js.

> **Status:** planejamento. Hoje a lógica roda como **server actions** e
> **route handlers** dentro do Next.js (`src/app/api`, `src/lib`). Nada foi
> movido nem reescrito.

## Princípios

- Contratos de entrada/saída definidos com **zod** em
  [`packages/domain`](../packages/domain/README.md) e compartilhados com o
  frontend.
- Autenticação por **sessão JWT em cookie httpOnly** (mecanismo atual,
  **preservado** — ver [`packages/auth`](../packages/auth/README.md)).
- Multi-tenant: toda query escopada por `organizationId`.
- Versionamento sob `/v1`.

## Endpoints previstos (espelham as telas atuais)

### Saúde
- `GET /health` — app vivo.
- `GET /health/database` — conectividade com o banco.

### Autenticação
- `POST /v1/auth/login` — login/senha → sessão.
- `POST /v1/auth/logout` — encerra sessão.
- `GET  /v1/auth/me` — usuário/perfil atual.

### Crianças
- `GET    /v1/children` — lista (escopada por organização/perfil).
- `POST   /v1/children` — cadastro.
- `GET    /v1/children/:id` — detalhe.
- `PATCH  /v1/children/:id` — edição.

### Trilhas / Conteúdos
- `GET /v1/tracks`, `GET /v1/tracks/:id`
- `GET /v1/contents`, `GET /v1/contents/:id`

### Acompanhamento (evolução)
- `GET  /v1/children/:id/progress` — registros de evolução.
- `POST /v1/children/:id/progress` — novo registro.

### Relatórios
- `GET /v1/reports/...` — dados agregados / export PDF (hoje `@react-pdf/renderer`).

### Admin
- CRUD de trilhas, módulos e conteúdos (restrito a `ADMIN`).

## Autorização (RBAC)

Perfis `ADMIN` · `FAMILIA` · `PROFISSIONAL` · `PREFEITURA`, reaproveitando as
regras de `src/lib/auth/rbac.ts`. Cada endpoint declara os perfis permitidos.

## Estratégia de migração (sem big bang)

1. Subir `apps/api` com `/health` e `/v1/auth/*` espelhando o atual.
2. Migrar um domínio por vez (ex.: crianças), mantendo o server action antigo
   até o endpoint estar validado.
3. Frontend passa a consumir o endpoint atrás de **feature flag**, rota a rota.
4. Remover o caminho antigo só após paridade comprovada.

## Pendências de produto (do README atual)

- Isolamento multi-tenant efetivo (escopo por `organizationId`).
- CRUD completo de trilhas/módulos/conteúdos.
- Lançamento de registros de evolução pela interface.
- Exportação de relatórios (PDF) e dashboards por prefeitura.
- Testes automatizados e CI.

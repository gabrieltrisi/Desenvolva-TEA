# Deploy do Backend na Render

Guia (preparatório) para hospedar o futuro [`apps/api`](../apps/api/README.md)
na **Render**.

> **Status:** planejamento. O backend ainda não existe como app separado — a
> lógica de servidor vive no app Next.js atual. Nada foi provisionado.

## Por que Render para o backend

- Processo **Node de longa duração** (ideal para uma API HTTP persistente).
- **PostgreSQL gerenciado** no mesmo provedor, com backups.
- Healthchecks e auto-deploy a partir do Git.

## Pré-requisitos (futuros)

- `apps/api` existindo como serviço HTTP autônomo (Fase 4 do split).
- `packages/database` com Prisma + migrations.
- Banco PostgreSQL provisionado (Render Postgres ou externo).

## Variáveis de ambiente (backend)

| Variável        | Descrição                                              |
| --------------- | ------------------------------------------------------ |
| `DATABASE_URL`  | String de conexão do PostgreSQL gerenciado.            |
| `AUTH_SECRET`   | Segredo do JWT (mín. 32 chars). `openssl rand -base64 32`. |
| `PORT`          | Porta do serviço (Render injeta automaticamente).      |
| `NODE_ENV`      | `production`.                                           |
| `CORS_ORIGIN`   | Origem do frontend na Vercel (para liberar CORS).      |

## Esboço de `render.yaml` (Blueprint) — **ainda não aplicar**

```yaml
# infra/render/render.yaml (rascunho — criar apenas na Fase 6)
services:
  - type: web
    name: tea-api
    runtime: node
    plan: starter
    buildCommand: npm ci && npm run build --workspace apps/api
    startCommand: npm run start --workspace apps/api
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: tea-db
          property: connectionString
      - key: AUTH_SECRET
        generateValue: true
databases:
  - name: tea-db
    plan: starter
```

## Migrations em produção

```bash
npx prisma migrate deploy   # aplicar migrations no banco da Render
```

## Healthcheck

O app atual já expõe `GET /api/health` e `GET /api/health/database`. No backend
separado, esses endpoints devem migrar para `/health` e `/health/database` e
ser usados no `healthCheckPath` da Render.

## Próximos passos seguros

1. Concluir Fases 1–4 do [split](./FRONTEND_BACKEND_SPLIT.md) antes de provisionar.
2. Criar `infra/render/render.yaml` só quando `apps/api` existir e buildar.
3. Validar o backend localmente antes de conectar à Render.

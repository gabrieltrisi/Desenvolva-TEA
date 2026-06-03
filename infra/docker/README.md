# infra/docker

**Imagens e composições Docker.**

> ⚠️ **Placeholder.** O `docker-compose.yml` ativo (PostgreSQL local) continua
> na raiz do projeto. Nada foi movido.

## Objetivo

Centralizar a infraestrutura conteinerizada:

- Compose de desenvolvimento (PostgreSQL local) — hoje em `docker-compose.yml`
  na raiz.
- Futuros `Dockerfile` do backend ([`apps/api`](../../apps/api/README.md)) para
  deploy conteinerizado na Render (alternativa ao build nativo).
- Eventual compose de integração (api + db) para testes ponta a ponta.

## Por enquanto

Apenas documentação. O Compose de desenvolvimento permanece em
`docker-compose.yml` e continua sendo usado por `npm run db:up` / `db:down`.

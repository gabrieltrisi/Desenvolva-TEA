# infra/render

**Infraestrutura do backend na Render.**

> ⚠️ **Placeholder.** Nenhum recurso foi provisionado nem nenhum arquivo de
> infra ativo foi adicionado. Esta pasta reserva o lugar da configuração de
> deploy do backend.

## Objetivo

Guardar, no futuro, a configuração de deploy de [`apps/api`](../../apps/api/README.md)
na **Render**:

- `render.yaml` (Blueprint): definição do Web Service do backend + banco
  PostgreSQL gerenciado.
- Variáveis de ambiente do backend (`DATABASE_URL`, `AUTH_SECRET`, etc.).
- Healthcheck path (`/health`) para o load balancer.

## Por enquanto

Apenas documentação. O passo a passo está em
[`docs/RENDER_DEPLOYMENT.md`](../../docs/RENDER_DEPLOYMENT.md).

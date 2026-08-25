# packages/auth

**Autenticação e autorização compartilhadas.**

> ⚠️ **Placeholder.** A autenticação de produção continua em `src/lib/auth/`
> e `src/proxy.ts`. **Não trocaremos o mecanismo de auth nesta etapa.**

## Objetivo

Isolar o mecanismo de autenticação atual para reuso entre
[`apps/api`](../../apps/api/README.md) (emite/valida sessão) e
[`apps/web`](../../apps/web/README.md) (lê sessão, protege rotas):

- Hash/verificação de senha (**bcryptjs**).
- Emissão e validação de **sessão JWT** (`jose`) em cookie `httpOnly`.
- RBAC por perfil (`ADMIN`, `FAMILIA`, `PROFISSIONAL`, `PREFEITURA`).
- Helpers de sessão (ler usuário atual, exigir perfil).

## Importante

O modelo atual — login/senha + JWT em cookie httpOnly — **será preservado**.
Este pacote apenas reempacota o que já existe; qualquer mudança de provedor de
auth é decisão futura e fora do escopo desta etapa.

## Estado atual

Mapeia hoje: `src/lib/auth/jwt.ts`, `session.ts`, `rbac.ts`, `actions.ts`,
`password.ts` e a proteção de rotas em `src/proxy.ts`.

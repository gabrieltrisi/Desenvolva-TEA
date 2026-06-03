# Deploy do Frontend na Vercel

Guia (preparatório) para hospedar o futuro [`apps/web`](../apps/web/README.md)
na **Vercel**.

> **Status:** planejamento. O frontend ainda é parte do app Next.js atual em
> `src/`. Nada foi conectado à Vercel.

## Por que Vercel para o frontend

- Plataforma nativa do **Next.js 16** (App Router), com edge/CDN e previews
  automáticos por PR.
- Build e deploy a partir do Git, com variáveis de ambiente por ambiente
  (Production/Preview/Development).

## Pré-requisitos (futuros)

- App Next.js movido para `apps/web` (Fase 5 do split).
- Backend disponível na Render, exposto por uma URL pública.
- Workspaces habilitados no `package.json` (Fase 1+).

## Configuração do projeto na Vercel

- **Root Directory:** `apps/web` (quando o app for movido).
- **Framework Preset:** Next.js (detectado automaticamente).
- **Build Command / Output:** padrão do Next.js.

## Variáveis de ambiente (frontend)

| Variável               | Descrição                                            |
| ---------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do frontend (sem barra final).           |
| `NEXT_PUBLIC_API_URL`  | URL pública do backend na Render.                    |
| `AUTH_SECRET`          | Necessário enquanto a sessão for validada no Next.   |

> Variáveis `NEXT_PUBLIC_*` vão para o bundle do cliente — **nunca** colocar
> segredos nelas. O `AUTH_SECRET` e `DATABASE_URL` pertencem ao backend.

## Esboço de `vercel.json` — **ainda não aplicar**

```json
// infra/vercel/vercel.json (rascunho — criar apenas na Fase 6)
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://tea-api.onrender.com/:path*" }
  ]
}
```

> O rewrite acima é uma das estratégias para o frontend falar com o backend sem
> problemas de CORS. A alternativa é chamar `NEXT_PUBLIC_API_URL` diretamente
> com CORS liberado no backend.

## Próximos passos seguros

1. Manter o deploy atual (servidor Node / `next start`) funcionando até a Vercel
   estar validada.
2. Mover o app para `apps/web` só após `apps/api` e `packages/*` estáveis.
3. Conectar a Vercel apontando o Root Directory para `apps/web`.

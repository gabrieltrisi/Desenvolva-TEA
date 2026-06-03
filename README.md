# Desenvolva TEA

Plataforma web (SaaS) para acompanhamento do desenvolvimento de crianças com TEA,
voltada a **famílias**, **profissionais** e, futuramente, **prefeituras**.

> Status: **MVP — estrutura inicial**

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design system humanizado)
- **PostgreSQL** + **Prisma 7**
- **Autenticação** própria: login/senha (bcrypt) + sessão JWT em cookie httpOnly
- Estrutura **multi-tenant ready** (modelo `Organization`)

## Arquitetura futura: Frontend Vercel + Backend Render

> **Status: planejamento — base preparada, nada movido ainda.**

O projeto evoluirá de um app Next.js monolítico para uma arquitetura de
**monorepo** com **Frontend (Vercel)** e **Backend (Render)** separados. Nesta
etapa apenas a **estrutura de pastas** foi criada — o app atual continua 100%
funcional em `src/`, sem mudanças em rotas, autenticação ou Prisma schema.

```
apps/
  web/        # Frontend Next.js → Vercel (futuro destino de src/)
  api/        # Backend HTTP → Render (futuro destino da lógica de servidor)
packages/
  database/   # Prisma schema + client
  domain/     # Regras de negócio + contratos (zod)
  auth/       # Senha (bcrypt) + sessão JWT (jose) + RBAC
  ui/         # Design system (componentes + Tailwind)
  config/     # tsconfig/eslint/env compartilhados
infra/
  render/     # Blueprint do backend (futuro)
  vercel/     # Config do frontend (futuro)
  docker/     # Compose/Dockerfiles
```

As pastas acima contêm `README.md` explicando seu objetivo, mas **nenhum código
de produção foi movido** e o `package.json`/workspaces **não foi alterado**
(habilitar workspaces agora poderia quebrar o build — fica para uma fase
futura). Documentação completa:

- [`docs/FRONTEND_BACKEND_SPLIT.md`](docs/FRONTEND_BACKEND_SPLIT.md) — plano e roadmap por fases
- [`docs/API_ROADMAP.md`](docs/API_ROADMAP.md) — endpoints previstos do backend
- [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md) — deploy do backend
- [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md) — deploy do frontend

## Estrutura de pastas

```
prisma/
  schema.prisma        # modelagem do banco
  seed.ts              # dados de demonstração
src/
  app/
    (auth)/login/      # tela de login (pública)
    (app)/             # área autenticada (shell com sidebar/topbar)
      dashboard/  criancas/  trilhas/  conteudos/
      acompanhamento/ relatorios/ admin/
  components/
    ui/                # Button, Card, Input, Badge, Avatar, StatCard...
    layout/            # Sidebar, Topbar, AppShell
  lib/
    auth/              # jwt, session, rbac, actions, password
    children/          # actions de cadastro
    prisma.ts          # singleton do Prisma Client
    env.ts             # validação das variáveis de ambiente (zod)
    site.ts            # configuração de SEO/marca (URL, descrições)
    labels.ts utils.ts
  proxy.ts             # proteção de rotas por sessão (Next 16: proxy)
  instrumentation.ts   # valida o ambiente no boot do servidor
docker-compose.yml     # PostgreSQL local
```

## Perfis de usuário

`ADMIN` · `FAMILIA` · `PROFISSIONAL` · `PREFEITURA` (previsto). A navegação e o
acesso são filtrados por perfil (ver `src/lib/auth/rbac.ts`).

## Como rodar localmente

Pré-requisitos: **Node 20+**, **Docker** (para o PostgreSQL).

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env (já incluído neste projeto; baseado em .env.example)
#    Ajuste AUTH_SECRET em produção.

# 3. Subir o banco PostgreSQL
npm run db:up

# 4. Criar as tabelas (primeira migration)
npm run prisma:migrate     # nomeie a migration, ex.: "init"

# 5. Popular dados de demonstração
npm run db:seed

# 6. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000.

### Credenciais de teste (senha: `senha123`)

| Perfil       | E-mail                          |
| ------------ | ------------------------------- |
| ADMIN        | admin@desenvolvatea.com         |
| FAMILIA      | familia@desenvolvatea.com       |
| PROFISSIONAL | profissional@desenvolvatea.com  |
| PREFEITURA   | prefeitura@desenvolvatea.com    |

## Scripts úteis

| Script                      | Descrição                             |
| --------------------------- | ------------------------------------- |
| `npm run dev`               | Servidor de desenvolvimento           |
| `npm run build`             | Build de produção                     |
| `npm run db:up` / `db:down` | Sobe/derruba o PostgreSQL (Docker)    |
| `npm run prisma:migrate`    | Cria/aplica migrations                |
| `npm run prisma:studio`     | Prisma Studio (UI do banco)           |
| `npm run db:seed`           | Popula dados de demonstração          |
| `npm run db:reset`          | Reseta o banco e re-aplica migrations |

## Produção / Deploy (Node server)

Deploy pensado para um **servidor Node** (`next start`) atrás de um proxy
reverso (Nginx, Caddy, Traefik) que termina o TLS.

```bash
# 1. Variáveis de ambiente (validadas no boot — ver src/lib/env.ts)
#    Obrigatórias: DATABASE_URL, AUTH_SECRET (mín. 32 chars em produção)
#    Recomendada:  NEXT_PUBLIC_SITE_URL = domínio público (sem barra final)
#    Gere o segredo:  openssl rand -base64 32

# 2. Aplicar migrations no banco de produção
npx prisma migrate deploy

# 3. Build e start
npm run build
npm run start            # escuta em PORT (padrão 3000)
```

Itens de prontidão já incluídos:

- **Healthcheck**: `GET /api/health` → `200` (app + banco OK) ou `503` (banco
  indisponível). Use no proxy/load balancer.
- **Healthcheck do banco**: `GET /api/health/database` →
  `200 { "status": "healthy" }` ou
  `503 { "status": "unhealthy", "reason": "database_unreachable" }`.
- **Resiliência a banco fora do ar**: falhas de infraestrutura
  (`P1001`, `ECONNREFUSED`, `PrismaClientInitializationError`) são
  interceptadas globalmente e exibidas como a tela amigável _"Banco de dados
  temporariamente indisponível"_, sem stack trace. No boot, o servidor loga
  `✓ Database connected` ou `✗ Database unavailable`.
- **Cabeçalhos de segurança**: aplicados a todas as respostas em
  `next.config.ts` (HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`). O HSTS só tem efeito sob HTTPS — garanta o redirect
  para HTTPS no proxy.
- **SEO**: `metadataBase`, Open Graph/Twitter, `robots.txt`, `sitemap.xml`,
  `manifest.webmanifest` e ícones (`icon.svg`, `apple-icon`) gerados
  automaticamente a partir de `NEXT_PUBLIC_SITE_URL`.
- **Páginas públicas**: `/`, `/login`, `/privacidade`, `/termos` (as legais
  ainda têm campos `[PREENCHER]` — revisar com o jurídico).
- **Estados de UI**: `loading.tsx` (skeletons), `not-found.tsx` (404),
  `error.tsx` + `global-error.tsx` (500) e `EmptyState` nas listas.

> **CSP**: não há `Content-Security-Policy` por padrão para evitar quebras com
> os scripts do Next. Adicione uma política (com `nonce`) quando for endurecer a
> segurança.

## Problemas comuns

### `P1001: Can't reach database server`

O banco PostgreSQL não está no ar (Docker parado ou container não iniciado).
A aplicação **não quebra**: exibe a tela _"Banco de dados temporariamente
indisponível"_. Para resolver:

```bash
npm run db:up        # sobe o PostgreSQL (Docker Compose)
```

Confirme com o healthcheck:

```bash
curl http://localhost:3000/api/health/database
# { "status": "healthy" }
```

### `PrismaClientKnownRequestError` na primeira query de uma rota

Sintoma do mesmo problema acima: com o driver adapter (`@prisma/adapter-pg`),
a falha de conexão aflora como erro de query na primeira chamada ao banco.
Verifique se o container está de pé (`docker ps`) e rode `npm run db:up`.

### `PrismaClientInitializationError` / `ECONNREFUSED`

Banco inacessível na URL configurada. Confira o `DATABASE_URL` no `.env`
(host/porta — o padrão deste projeto é `localhost:5433`) e se o serviço está
ativo (`npm run db:up`).

### Mudei o `schema.prisma` e os tipos não atualizaram

```bash
npm run prisma:generate     # regenera o Prisma Client
```

## Próximos passos (pós-MVP)

- Isolamento multi-tenant efetivo (escopo por `organizationId` em middleware/queries)
- CRUD completo de trilhas, módulos e conteúdos (painel admin)
- Lançamento de registros de evolução pela interface
- Exportação de relatórios (PDF) e dashboards por prefeitura
- Testes automatizados e CI

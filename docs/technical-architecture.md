# Arquitetura técnica — Appolitica

## Visão executiva

Appolitica é uma **plataforma web de transparência política** construída como um **monorepo pnpm** com backend Node.js + frontend React. Os dados fluem de APIs públicas do governo → banco de dados Postgres → aplicação → browser.

**Stack mínimo:**
- **Linguagem:** TypeScript (100%)
- **Backend:** Node.js 20+ + Hono + Drizzle ORM
- **Frontend:** React 19 + Vite + TypeScript
- **Banco:** PostgreSQL 15+
- **Infra:** Docker Compose (local), Railway/Heroku (produção)
- **Package manager:** pnpm 9.15.9

---

## 1. Estrutura do projeto (monorepo)

```
appolitica/
├── apps/
│   ├── api/              ← Backend Node.js + Hono
│   │   ├── src/
│   │   │   ├── db/       ← Schema Drizzle, migrations, repository
│   │   │   ├── routes/   ← Endpoints HTTP (auth, politicos, portal)
│   │   │   ├── services/ ← Integrações: Câmara, Senado
│   │   │   ├── scripts/  ← CLI: sync, seed, backfill
│   │   │   └── index.ts  ← Entrada Hono server
│   │   ├── Dockerfile    ← Container Node.js
│   │   └── package.json
│   │
│   └── web/              ← Frontend React + Vite
│       ├── src/
│       │   ├── components/    ← UI: filtros, cards, detalhes
│       │   ├── hooks/         ← Custom hooks
│       │   ├── lib/           ← Utils (api.ts, etc)
│       │   └── App.tsx        ← Root
│       ├── Dockerfile         ← Nginx + build estático
│       └── package.json
│
├── packages/
│   └── types/            ← Tipos compartilhados (export único)
│       ├── src/index.ts  ← Mandatario, GeneroPolitico, etc
│       └── package.json
│
├── docker-compose.yml    ← Serviços: postgres
├── pnpm-workspace.yaml   ← Definição monorepo
├── turbo.json            ← Config build orquestração
└── package.json          ← Root scripts
```

**pnpm workspaces:** gerencia tipos, api, web como um projeto só.
**Turbo:** cache e paralelização de builds.

---

## 2. Backend (Node.js + Hono + Drizzle)

### Stack

| Layer | Tech | Versão |
|---|---|---|
| **Runtime** | Node.js | 20+ |
| **HTTP** | Hono | 4.x |
| **ORM** | Drizzle | 0.45+ |
| **Database** | PostgreSQL | 15+ |
| **Auth** | bcryptjs + sessions | — |

### Endpoints principais

| Rota | Método | Descrição |
|---|---|---|
| `/politicos` | GET | Lista com filtros (cargo, partido, genero, uf) |
| `/politicos/by-id/:id` | GET | Detalhe um político |
| `/auth/login` | POST | Login email + password |
| `/auth/register` | POST | Cadastro novo usuário |
| `/auth/me` | GET | Usuário autenticado |

### Banco de dados

**Tabelas principais:**

```sql
mandatarios      -- políticos em exercício
sync_metadata    -- log de sincronizações
users            -- autenticação
user_sessions    -- sessões HTTP
user_acompanhamentos -- cola/favoritos
```

**Ciclo de sync:**
1. `pnpm sync:db` → executa scripts
2. Conecta Câmara + Senado APIs
3. Normaliza dados (mapeia genero, etc)
4. Persiste em Postgres via Drizzle
5. Grava timestamp em sync_metadata

---

## 3. Frontend (React + Vite)

### Stack

| Layer | Tech |
|---|---|
| **View** | React 19 |
| **Bundler** | Vite 8.x |
| **Styling** | CSS Modules |
| **State** | React Hooks |
| **API** | Fetch |

### Fluxo

```
App.tsx (estado global)
├── SearchFilters  (dropdowns)
├── PoliticoCard[]  (lista)
└── PoliticoDetail (detalhe)
    └── fetch GET /politicos/by-id/{id}
```

### Custom hooks

| Hook | Responsabilidade |
|---|---|
| `usePoliticos()` | Fetch lista com filtros |
| `useAuth()` | Login/logout |
| `useCola()` | Acompanhamento/favoritos |
| `useMeusRepresentantes()` | Reps por UF |
| `usePoliticoDetail()` | Fetch detalhe |

---

## 4. Infraestrutura

### Local development

```bash
pnpm infra:up    # docker-compose up (Postgres)
pnpm sync:db     # Migrations + seed + sync
pnpm dev         # api (localhost:3000) + web (localhost:5173)
```

**Docker Compose:** Postgres 15 + volume persistente

### Variáveis de ambiente

**apps/api/.env:**
```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=development
```

**apps/web/.env:**
```
VITE_API_URL=http://localhost:3000
```

### Produção

Opções: Railway, Vercel (frontend), self-hosted (Docker).

---

## 5. Fluxo completo

### "Usuário abre app"
1. Browser → Nginx/SPA
2. React → `useEffect` → `GET /politicos`
3. Backend → Postgres → JSON array
4. Render `PoliticoCard`

### "Admin faz sync"
1. `pnpm sync:db`
2. Câmara + Senado APIs → normaliza
3. `upsertMandatarios()` → Postgres
4. `process.exit(0)`

---

## 6. Decisões arquiteturais

| Decisão | Razão |
|---|---|
| **Monorepo pnpm** | Compartilhar tipos, cache, local dev simples |
| **TypeScript 100%** | Type safety end-to-end |
| **Hono** | Lightweight, serverless-ready |
| **Drizzle** | Type-safe queries, zero-runtime |
| **React hooks** | Simples para PoC, sem Redux |
| **Postgres** | ACID, JSONB, índices de filtro |
| **Sync via CLI** | Controle manual, robusto |
| **Cache Postgres** | Evita rate limit APIs |

---

## 7. Performance & segurança

**Performance:**
- Turbo cache: rebuilds 3–10x mais rápido
- Postgres indexes: cargo, uf, partido, fonte
- Vite <100ms dev updates

**Segurança:**
- ✅ Types compartilhados: evita desync
- ✅ Password hash: bcryptjs
- ✅ HTTP-only cookies: seguro vs XSS
- ✅ CORS: backend whitelist
- ❌ Rate limit: TODO
- ❌ Admin roles: TODO


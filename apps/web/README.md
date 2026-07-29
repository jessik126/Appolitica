# Appolitica Web

SPA do Appolitica — cola de votação, acompanhamento de políticos e cobrança cívica.

## Stack

- React 19 + TypeScript
- Vite (proxy `/api` → BFF na porta 3001)
- Tailwind CSS
- `@appolitica/types` — tipos compartilhados
- Catálogo completo via BFF + Postgres (federal + mock)

## Como rodar

Na raiz do monorepo (recomendado):

```bash
pnpm install
pnpm infra:up
pnpm --filter @appolitica/api db:migrate
pnpm --filter @appolitica/api seed:mock   # primeira vez
pnpm --filter @appolitica/api sync
pnpm dev
```

Abra `http://localhost:5173`.

## Funcionalidades

- **Início** — proposta de valor, onboarding por UF, atalhos
- **Cola** — escolha por cargo (presidente → deputado estadual), persistida separadamente
- **Explorar** — busca/filtros; catálogo unificado (federal + mock)
- **Meus** — acompanhamentos, notas, ações recentes, cobrança por e-mail

## Persistência (localStorage)

| Chave | Conteúdo |
|-------|----------|
| `appolitica_acompanhamento_v2` | Políticos que você acompanha |
| `appolitica_cola_v1` | Escolhas da cola por cargo |
| `appolitica_uf_v1` | UF preferida para filtros |

A chave legada `appolitica_meus_representantes_v1` é migrada automaticamente.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | Lint com oxlint |
| `pnpm preview` | Preview do build |

Na raiz: `pnpm --filter @appolitica/web <script>`

## Docker

```bash
docker build -f apps/web/Dockerfile -t appolitica-web .
```

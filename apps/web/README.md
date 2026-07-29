# Appolitica Web

SPA do Appolitica — cola de votação, acompanhamento de políticos e cobrança cívica.

## Stack

- React 19 + TypeScript
- Vite (proxy `/api` → BFF na porta 3001)
- Tailwind CSS
- `@appolitica/types` — tipos compartilhados
- Dados federais via BFF; mock JSON para cargos sem TSE

## Como rodar

Na raiz do monorepo (recomendado — sobe web + api):

```bash
pnpm install
pnpm dev
```

Ou apenas este app (sem dados federais reais):

```bash
pnpm --filter @appolitica/web dev
```

Abra `http://localhost:5173`.

## Funcionalidades

- **Início** — proposta de valor, onboarding por UF, atalhos
- **Cola** — escolha por cargo (presidente → deputado estadual), persistida separadamente
- **Explorar** — busca/filtros; deputados e senadores reais + mock local
- **Meus** — acompanhamentos, notas, ações recentes, cobrança por e-mail

## Persistência (localStorage)

| Chave | Conteúdo |
|-------|----------|
| `appolitica_acompanhamento_v2` | Políticos que você acompanha |
| `appolitica_cola_v1` | Escolhas da cola por cargo |
| `appolitica_uf_v1` | UF preferida para filtros |

A chave legada `appolitica_meus_representantes_v1` é migrada automaticamente.

## Mock JSON

Catálogo mock em `public/data/politicos.json` — **apenas** presidente, governador e deputado estadual. Deputado federal e senador vêm da API.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | Lint com oxlint |
| `pnpm preview` | Preview do build |

Na raiz: `pnpm --filter @appolitica/web <script>`

# @appolitica/api

BFF (Backend for Frontend) do Appolitica — proxy para Câmara e Senado com catálogo persistido em Postgres.

## Infraestrutura

```bash
pnpm infra:up    # Colima/Docker + Postgres (porta 5432)
pnpm infra:down  # Para o Postgres (volume preservado)
```

Copie [`apps/api/.env.example`](.env.example) para `apps/api/.env` e ajuste se necessário.

## Rodar

```bash
pnpm infra:up
pnpm --filter @appolitica/api db:migrate
pnpm --filter @appolitica/api seed:mock   # primeira vez
pnpm --filter @appolitica/api sync
pnpm --filter @appolitica/api dev
```

Porta padrão: `3001` (override com `PORT`).

Na raiz, `pnpm dev` sobe web + api (migrations rodam no boot da API).

## Sync

```bash
pnpm --filter @appolitica/api sync
pnpm --filter @appolitica/api sync:camara
pnpm --filter @appolitica/api sync:senado
pnpm --filter @appolitica/api seed:mock
```

Dados gravados em Postgres (`mandatarios`, `acoes`, `sync_metadata`).

## Banco de dados

| Comando | Descrição |
|---------|-----------|
| `db:migrate` | Aplica migrations Drizzle |
| `db:generate` | Gera migration a partir do schema |
| `db:studio` | UI do Drizzle Studio |

## Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Postgres (default: `postgresql://appolitica:appolitica@localhost:5432/appolitica`) |
| `PORT` | Porta do servidor (default 3001) |
| `SESSION_SECRET` | Segredo para hash de tokens de sessão (obrigatório em produção) |
| `PORTAL_TRANSPARENCIA_TOKEN` | Token do [Portal da Transparência](https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email) — ver `GET /portal/status` |

## Autenticação

Sessões via cookie HTTP-only (`appolitica_session`). Endpoints:

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro (name, email, password) |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/logout` | Encerra sessão |
| `GET` | `/auth/me` | Usuário autenticado |
| `PATCH` | `/me` | Atualiza UF / onboarding |
| `GET/PUT` | `/me/acompanhamento` | Lista de políticos seguidos |
| `GET/PUT` | `/me/cola` | Cola de votação |

Tabelas: `users`, `sessions`, `user_acompanhamentos`, `user_cola`.

## Endpoints

Ver [README raiz](../../README.md#endpoints-da-api).

## Docker

Build da imagem de produção:

```bash
docker build -f apps/api/Dockerfile -t appolitica-api .
```

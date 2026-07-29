# @appolitica/api

BFF (Backend for Frontend) do Appolitica — proxy para Câmara e Senado com cache local.

## Rodar

```bash
pnpm --filter @appolitica/api dev
```

Porta padrão: `3001` (override com `PORT`).

## Sync

```bash
pnpm --filter @appolitica/api sync
pnpm --filter @appolitica/api sync:camara
pnpm --filter @appolitica/api sync:senado
```

Cache gravado em `data/*.json` (gitignored).

## Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `PORT` | Porta do servidor (default 3001) |
| `PORTAL_TRANSPARENCIA_TOKEN` | Token do [Portal da Transparência](https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email) — ver `GET /portal/status` |

## Endpoints

Ver [README raiz](../../README.md#endpoints-da-api).

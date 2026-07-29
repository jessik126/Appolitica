# Fontes de dados — Appolitica

## Em uso no PoC

### Câmara dos Deputados (primária)

- Docs: https://dadosabertos.camara.leg.br/swagger/api.html
- Base: `https://dadosabertos.camara.leg.br/api/v2/`
- Auth: nenhuma
- Uso: listagem de deputados, perfil, proposições autoria, votações recentes
- Cache: `apps/api/data/camara-deputados.json` (gerado por `pnpm --filter @appolitica/api sync:camara`)

### Senado Federal (secundária)

- Docs: https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html
- Base: `https://legis.senado.leg.br/dadosabertos`
- Auth: nenhuma
- Uso: senadores em exercício, votações e processos via `/votacao` e `/processo`
- Cache: `apps/api/data/senado-senadores.json`

### Mock local

- Arquivo: `apps/web/public/data/politicos.json`
- Cargos: presidente, governador, deputado estadual (até integração TSE)
- Deputado federal e senador vêm do BFF, não do mock

### Despesas CEAP (deputados)

- Endpoint BFF: `GET /politicos/by-id/CD:{id}/despesas?ano=2025`
- Fonte: Câmara `/deputados/{id}/despesas`
- UI: seção "Gastos com cota parlamentar" no detalhe do deputado

### Portal da Transparência

- Docs: https://api.portaldatransparencia.gov.br/swagger-ui/index.html
- Cadastro: https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email (conta Gov.br)
- Header: `chave-api-dados: SEU_TOKEN`
- Config: `PORTAL_TRANSPARENCIA_TOKEN` em `apps/api/.env` (ver `.env.example`)
- Limites: ~400 req/min (700 entre 00h–06h); endpoints restritos ~180 req/min
- Endpoints BFF:
  - `GET /portal/status` — valida token
  - `GET /portal/despesas/orgao?codigoOrgao=20000&ano=2025&mes=1` — gasto executivo por órgão

**Uso no produto:** despesas de deputado vêm da **Câmara (CEAP)**. O Portal serve para gasto do Poder Executivo e consultas por órgão/favorecido.

### Pós-PoC — Portal por favorecido

Para lookup por CPF/CNPJ: `/despesas/documentos-por-favorecido` (restrito, 180 req/min). Requer mapear identidade do político → CPF.

## Regras de arquitetura

- Nunca chamar Câmara, Senado ou Portal da Transparência direto do browser (CORS + rate limits)
- IDs federais normalizados: `CD:{id}` (deputado), `SF:{codigo}` (senador)
- IDs não são compartilhados entre casas

# Fontes de dados — Appolitica

## Visão geral

Appolitica agrega dados de políticos brasileiros de múltiplas fontes oficiais. Todos os dados são **sincronizados para Postgres** e servidos via API REST (nunca direto do browser).

## Fontes ativas

### 1. Câmara dos Deputados (primária)

**Escopo:** deputados federais em exercício, perfil, proposições e votações

| | |
|---|---|
| **Endpoint** | https://dadosabertos.camara.leg.br/api/v2/ |
| **Autenticação** | Nenhuma |
| **Sync** | `pnpm sync:db` → `apps/api/src/scripts/sync-all.ts` |
| **Tabela** | `mandatarios` (casa='CD') |
| **Frequência** | Manual (pode ser agendado) |
| **Docs** | https://dadosabertos.camara.leg.br/swagger/api.html |

**Dados capturados:** nome civil, nome parlamentar, gênero, UF, partido, foto, email, gabinete.

### 2. Senado Federal (secundária)

**Escopo:** senadores em exercício, composição por UF

| | |
|---|---|
| **Endpoint** | https://legis.senado.leg.br/dadosabertos |
| **Autenticação** | Nenhuma |
| **Sync** | `pnpm sync:db` → `apps/api/src/scripts/sync-all.ts` |
| **Tabela** | `mandatarios` (casa='SF') |
| **Frequência** | Manual (pode ser agendado) |
| **Docs** | https://legis.senado.leg.br/dadosabertos/api-docs/ |

**Dados capturados:** idem Câmara; validação de mandatos 2023–2027.

### 3. Dados mock curado

**Escopo:** presidente, governadores, deputados estaduais (fora do fluxo live)

| | |
|---|---|
| **Fonte** | `apps/api/src/data/mock-politicos.seed.json` |
| **Seed** | `pnpm sync:db` (incluso) |
| **Tabela** | `mandatarios` (casa=null) |
| **Uso** | Testes, protótipos, fases sem TSE |

**Razão:** TSE não oferece API aberta em tempo real para estaduais e municipais ainda.

## Restrições de segurança

- ❌ Nunca chamar APIs de Câmara, Senado direto do browser (CORS bloqueado, rate limits)
- ✅ Sempre via backend (`apps/api/src/routes/*`)
- ✅ Cache em Postgres para reduzir requisições
- ✅ Sync manual ou agendado

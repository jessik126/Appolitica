# Appolitica

Ferramenta para o eleitor brasileiro **lembrar quem votou**, **acompanhar** as ações dos representantes e **cobrar** resultados — ou repensar o voto nas próximas eleições.

## Visão

O Appolitica nasce da ideia de facilitar a participação política: em um país com vocabulário complexo e poucas fontes confiáveis, uma forma simples de trazer as pessoas para dentro desse mundo é lembrá-las de **quem elas escolheram para representá-las**.

## PoC atual (4–6 semanas)

Dual-track thin PoC:

- **Cola de votação** — escolha por cargo (localStorage), mock para cargos sem TSE ainda
- **Acompanhar federal** — deputados e senadores reais via BFF (`apps/api`)
- **Atividade recente** — votações e proposições em linguagem simples (Câmara + Senado)
- **Sem contas** — cola e acompanhamento ficam no navegador

### Rodar o app

Na raiz do repositório:

```bash
pnpm setup
pnpm dev
```

Isso inicia **Postgres** (Docker/Colima), aplica migrations, carrega mock + dados federais, e sobe **web** (Vite, porta 5173) + **api** (Hono, porta 3001). O frontend faz proxy de `/api` para o BFF.

Na primeira requisição a `/politicos`, a API sincroniza deputados e senadores automaticamente se o banco estiver vazio (pode levar alguns segundos).

### Infraestrutura local

```bash
pnpm infra:up    # Colima (se instalado) + Postgres via Docker Compose
pnpm infra:down  # Para o Postgres (volume preservado)
```

### Sincronizar dados manualmente

```bash
pnpm --filter @appolitica/api sync          # Câmara + Senado
pnpm --filter @appolitica/api sync:camara   # só deputados
pnpm --filter @appolitica/api sync:senado   # só senadores
```

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/politicos?uf=&partido=&q=&casa=` | Lista completa (federal + mock) |
| GET | `/politicos/by-id/:id` | Perfil + ações (`CD:123`, `SF:456` ou mock) |
| GET | `/politicos/by-id/:id/acoes` | Feed de ações |
| POST | `/sync/camara` | Atualiza deputados no Postgres |
| POST | `/sync/senado` | Atualiza senadores no Postgres |
| POST | `/sync/all` | Atualiza ambos |

Documentação completa do frontend: [apps/web/README.md](apps/web/README.md)

## Estrutura do repositório

```
Appolitica/
├── apps/
│   ├── api/        # BFF — Câmara, Senado, Postgres
│   └── web/        # React SPA
├── docker-compose.yml
├── scripts/        # infra:up / infra:down
├── packages/
│   └── types/      # Tipos compartilhados
├── docs/           # Documentação de marca e estratégia
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Fontes de dados

| Fonte | Uso | Auth |
|-------|-----|------|
| [Câmara Dados Abertos](https://dadosabertos.camara.leg.br/swagger/api.html) | Deputados, proposições, votações | Nenhuma |
| [Senado Dados Abertos](https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html) | Senadores, processos, votações | Nenhuma |
| Mock curado (Postgres) | Presidente, governador, deputado estadual | — |
| [Portal da Transparência](https://api.portaldatransparencia.gov.br/swagger-ui/index.html) | **Pós-PoC** — despesas executivas | Token Gov.br |

Ver [docs/data-sources.md](docs/data-sources.md) para detalhes de integração e Portal da Transparência.

## Scripts (raiz)

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instala dependências de todo o monorepo |
| `pnpm dev` | Inicia web + api em modo desenvolvimento |
| `pnpm infra:up` | Sobe Postgres (Colima/Docker) |
| `pnpm infra:down` | Para Postgres |
| `pnpm build` | Build de produção de todos os pacotes |
| `pnpm lint` | Lint de todos os pacotes |
| `pnpm preview` | Preview do build do web |
| `pnpm run deploy` | Executa deploy de todos os pacotes |
| `pnpm run deploy:web` | Deploy apenas do frontend |

Para rodar um pacote específico:

```bash
pnpm --filter @appolitica/web dev
pnpm --filter @appolitica/api dev
```

## Documentação de marca

O exercício de posicionamento e público-alvo está em [docs/lab_marcas.md](docs/lab_marcas.md).

## Evolução prevista

- Integração TSE para cola com candidatos reais
- Conta de usuário e sincronização na nuvem
- Notificações push sobre políticos seguidos
- Portal da Transparência para despesas (após CEAP via Câmara)
- App mobile / PWA
- Comparação de histórico eleitoral

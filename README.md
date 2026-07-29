# Appolitica

Ferramenta para o eleitor brasileiro **lembrar quem votou**, **acompanhar** as ações dos representantes e **cobrar** resultados — ou repensar o voto nas próximas eleições.

## Visão

O Appolitica nasce da ideia de facilitar a participação política: em um país com vocabulário complexo e poucas fontes confiáveis, uma forma simples de trazer as pessoas para dentro desse mundo é lembrá-las de **quem elas escolheram para representá-las**.

## MVP atual

O primeiro protótipo é um **app web de página única**, sem backend, para validar a proposta:

- Catálogo de políticos alimentado por JSON editável
- Lista pessoal do eleitor salva no navegador
- Contatos e ações recentes (mock) para cobrança e acompanhamento

### Rodar o app

Na raiz do repositório:

```bash
pnpm install
pnpm dev
```

Documentação completa do frontend: [apps/web/README.md](apps/web/README.md)

## Estrutura do repositório

```
Appolitica/
├── apps/
│   └── web/        # MVP React (SPA)
├── packages/       # Bibliotecas compartilhadas (futuro)
├── docs/           # Documentação de marca e estratégia
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Scripts (raiz)

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instala dependências de todo o monorepo |
| `pnpm dev` | Inicia apps em modo desenvolvimento |
| `pnpm build` | Build de produção de todos os pacotes |
| `pnpm lint` | Lint de todos os pacotes |
| `pnpm preview` | Preview do build do web |
| `pnpm run deploy` | Executa deploy de todos os pacotes |
| `pnpm run deploy:web` | Deploy apenas do frontend |

Para rodar um pacote específico:

```bash
pnpm --filter @appolitica/web dev
```

## Documentação de marca

O exercício de posicionamento e público-alvo está em [docs/lab_marcas.md](docs/lab_marcas.md).

## Evolução prevista

- API backend (`apps/api`)
- Notícias dos políticos favoritos (votados ou em observação)
- Integração com dados abertos (Câmara, Senado, TSE)
- App mobile / PWA
- Conta de usuário e sincronização na nuvem

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

```bash
cd web
npm install
npm run dev
```

Documentação completa do frontend: [web/README.md](web/README.md)

## Estrutura do repositório

```
Appolitica/
├── docs/           # Documentação de marca e estratégia
├── web/            # MVP React (SPA)
└── README.md
```

## Documentação de marca

O exercício de posicionamento e público-alvo está em [docs/lab_marcas.md](docs/lab_marcas.md).

## Evolução prevista

- Notícias dos políticos favoritos (votados ou em observação)
- Integração com dados abertos (Câmara, Senado, TSE)
- App mobile / PWA
- Conta de usuário e sincronização na nuvem

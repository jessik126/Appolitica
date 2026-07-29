# Appolitica Web

SPA de validação do MVP Appolitica — ferramenta para o eleitor guardar os políticos que votou na eleição de 2026 e acompanhar suas ações.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Dados mock em JSON (`public/data/politicos.json`)
- Persistência local via `localStorage` (sem backend)

## Como rodar

```bash
cd web
npm install
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

## Editar dados dos políticos

O catálogo fica em **`public/data/politicos.json`**. Você pode editar este arquivo a qualquer momento — basta recarregar a página no navegador.

### Campos obrigatórios por político

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador único (ex.: `dep-federal-sp-001`) |
| `nome` | Nome completo |
| `nomeUrna` | Nome de urna |
| `cargo` | `presidente`, `governador`, `senador`, `deputado_federal` ou `deputado_estadual` |
| `partido` | Sigla do partido |
| `uf` | UF (use `BR` para presidente) |
| `contatos` | Objeto com `email`, `site`, `instagram`, `twitter` (opcionais) |
| `resumo` | Breve descrição |
| `acoes` | Array de ações recentes |

### Exemplo de ação

```json
{
  "data": "2026-03-10",
  "tipo": "votacao",
  "titulo": "Votou a favor de...",
  "descricao": "Texto em linguagem simples para o eleitor.",
  "fonte": "https://..."
}
```

Tipos de ação: `votacao`, `projeto`, `discurso`, `outro`.

### Fotos oficiais

- Deputados federais: `https://www.camara.leg.br/internet/deputado/bandep/{idCamara}.jpg`
- Senadores: `https://www.senado.leg.br/senadores/img/fotos-oficiais/senador{idSenado}.jpg`

## Dados do eleitor (localStorage)

A lista "Meus Representantes" é salva no navegador com a chave `appolitica_meus_representantes_v1`.

Para resetar durante testes:
1. Abra DevTools (F12)
2. Application → Local Storage
3. Remova a chave `appolitica_meus_representantes_v1`

## Funcionalidades do MVP

- **Início** — proposta de valor e atalhos
- **Explorar** — busca, filtros (cargo, UF, partido) e marcação "Votei neste"
- **Meus Representantes** — lista pessoal, notas e botão "Cobrar por e-mail"

## Próximos passos (fora do MVP)

- Backend e banco de dados
- Feed de notícias automático
- Integração com APIs da Câmara e Senado
- Export/import da lista pessoal

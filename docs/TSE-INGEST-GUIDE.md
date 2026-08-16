# TSE Integration — Quick Start

## 📥 Ingestão de candidatos 2026

### Status
- ✅ Dependências instaladas (`csv-parse`)
- ✅ Scripts de parsing criados
- ✅ CSV data disponível em `docs/consulta_cand_2026/`
- ⏳ Schema ainda sem colunas TSE (próxima fase)

### Dados disponíveis
- 30 arquivos CSV (um por estado + Brasil)
- ~39,695 candidatos totais  
- Gênero, cargo, ocupação, educação, raça, CPF

### Próximo passo
1. Criar migration Drizzle para novas colunas
2. Atualizar types package
3. Rodar ingestão completa
4. Adicionar filtros frontend

Veja [docs/tse-integration-plan.md](tse-integration-plan.md) para roadmap completo.

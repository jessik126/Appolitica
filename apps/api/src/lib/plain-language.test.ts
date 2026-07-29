import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatProjetoAcao,
  formatVotacaoAcao,
} from '../lib/plain-language.js'

describe('plain-language formatters', () => {
  it('formats votacao with known vote label', () => {
    const acao = formatVotacaoAcao(
      '2026-01-15',
      'Sim',
      'Projeto de lei sobre educação básica',
      'https://example.com/voto',
    )
    assert.equal(acao.tipo, 'votacao')
    assert.match(acao.titulo, /a favor/)
    assert.equal(acao.fonte, 'https://example.com/voto')
  })

  it('formats projeto with sigla and numero', () => {
    const acao = formatProjetoAcao(
      '2026-02-01',
      'PL',
      1234,
      2026,
      'Institui programa nacional de alfabetização digital.',
    )
    assert.equal(acao.tipo, 'projeto')
    assert.match(acao.titulo, /PL 1234\/2026/)
    assert.match(acao.descricao, /alfabetização/)
  })
})

import { Hono } from 'hono'
import type { Acao, CasaLegislativa, Mandatario, Politico } from '@appolitica/types'
import { parsePoliticoId } from '@appolitica/types'
import {
  getCamaraCache,
  getCamaraDeputadoAcoes,
  getCamaraDeputadoDespesas,
  getCamaraDeputadoDetail,
  getCamaraDeputados,
} from '../services/camara.js'
import {
  getSenadoCache,
  getSenadorAcoes,
  getSenadorDetail,
  getSenadoSenadores,
} from '../services/senado.js'
import { todayIso } from '../services/cache.js'

const politicos = new Hono()

function filterMandatarios(
  list: Mandatario[],
  params: { casa?: string; uf?: string; partido?: string; q?: string },
): Mandatario[] {
  const term = params.q?.trim().toLowerCase() ?? ''

  return list.filter((m) => {
    if (params.casa && m.casa !== params.casa) return false
    if (params.uf && m.uf !== params.uf) return false
    if (params.partido && m.partido !== params.partido) return false
    if (!term) return true
    return (
      m.nome.toLowerCase().includes(term) ||
      m.nomeUrna.toLowerCase().includes(term) ||
      m.partido.toLowerCase().includes(term)
    )
  })
}

async function getAllFederalMandatarios(): Promise<Mandatario[]> {
  const [deputados, senadores] = await Promise.all([
    getCamaraDeputados(),
    getSenadoSenadores(),
  ])
  return [...deputados, ...senadores]
}

function toPolitico(m: Mandatario, acoes: Acao[] = []): Politico {
  return { ...m, acoes }
}

/** Resolve composite id like CD:204554 — must be registered before /:casa/:id */
politicos.get('/by-id/:politicoId/despesas', async (c) => {
  const politicoId = decodeURIComponent(c.req.param('politicoId'))
  const parsed = parsePoliticoId(politicoId)
  const ano = Number(c.req.query('ano') ?? new Date().getFullYear())

  if (!parsed) {
    return c.json({ error: 'ID inválido.' }, 400)
  }

  if (parsed.casa !== 'CD') {
    return c.json(
      { error: 'Despesas CEAP disponíveis apenas para deputados federais (CD).' },
      400,
    )
  }

  try {
    const resumo = await getCamaraDeputadoDespesas(parsed.externalId, ano)
    return c.json(resumo)
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar despesas.' },
      502,
    )
  }
})

politicos.get('/by-id/:politicoId/acoes', async (c) => {
  const politicoId = decodeURIComponent(c.req.param('politicoId'))
  const parsed = parsePoliticoId(politicoId)

  if (!parsed) {
    return c.json({ error: 'ID inválido.' }, 400)
  }

  const { casa, externalId } = parsed
  const desde = c.req.query('desde')

  let acoes: Acao[] =
    casa === 'CD'
      ? await getCamaraDeputadoAcoes(externalId)
      : await getSenadorAcoes(externalId)

  if (desde) {
    acoes = acoes.filter((a) => a.data >= desde)
  }

  return c.json({ acoes, total: acoes.length })
})

politicos.get('/by-id/:politicoId', async (c) => {
  const politicoId = decodeURIComponent(c.req.param('politicoId'))
  const parsed = parsePoliticoId(politicoId)

  if (!parsed) {
    return c.json({ error: 'ID inválido.' }, 400)
  }

  const { casa, externalId } = parsed
  let mandatario: Mandatario | null = null
  let acoes: Acao[] = []

  if (casa === 'CD') {
    mandatario = await getCamaraDeputadoDetail(externalId)
    if (mandatario) acoes = await getCamaraDeputadoAcoes(externalId)
  } else {
    mandatario = await getSenadorDetail(externalId)
    if (mandatario) acoes = await getSenadorAcoes(externalId)
  }

  if (!mandatario) {
    return c.json({ error: 'Político não encontrado.' }, 404)
  }

  return c.json(toPolitico(mandatario, acoes))
})

politicos.get('/', async (c) => {
  const casa = c.req.query('casa')
  const uf = c.req.query('uf')
  const partido = c.req.query('partido')
  const q = c.req.query('q')

  const all = await getAllFederalMandatarios()
  const filtered = filterMandatarios(all, { casa, uf, partido, q })

  const camaraMeta = await getCamaraCache()
  const senadoMeta = await getSenadoCache()

  return c.json({
    metadata: {
      eleicao: 2026,
      ultimaAtualizacao: camaraMeta?.metadata.ultimaAtualizacao ?? todayIso(),
      fonte: `Federal: ${camaraMeta?.metadata.fonte ?? 'Câmara'} + ${senadoMeta?.metadata.fonte ?? 'Senado'}`,
    },
    politicos: filtered.map((m) => toPolitico(m)),
    total: filtered.length,
  })
})

politicos.get('/:casa/:id', async (c) => {
  const casa = c.req.param('casa') as CasaLegislativa
  const externalId = c.req.param('id')

  if (casa !== 'CD' && casa !== 'SF') {
    return c.json({ error: 'Casa inválida. Use CD ou SF.' }, 400)
  }

  let mandatario: Mandatario | null = null
  let acoes: Acao[] = []

  if (casa === 'CD') {
    mandatario = await getCamaraDeputadoDetail(externalId)
    if (mandatario) acoes = await getCamaraDeputadoAcoes(externalId)
  } else {
    mandatario = await getSenadorDetail(externalId)
    if (mandatario) acoes = await getSenadorAcoes(externalId)
  }

  if (!mandatario) {
    return c.json({ error: 'Político não encontrado.' }, 404)
  }

  return c.json(toPolitico(mandatario, acoes))
})

politicos.get('/:casa/:id/despesas', async (c) => {
  const casa = c.req.param('casa') as CasaLegislativa
  const externalId = c.req.param('id')
  const ano = Number(c.req.query('ano') ?? new Date().getFullYear())

  if (casa !== 'CD') {
    return c.json(
      { error: 'Despesas CEAP disponíveis apenas para deputados federais (CD).' },
      400,
    )
  }

  try {
    const resumo = await getCamaraDeputadoDespesas(externalId, ano)
    return c.json(resumo)
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : 'Erro ao buscar despesas.' },
      502,
    )
  }
})

politicos.get('/:casa/:id/acoes', async (c) => {
  const casa = c.req.param('casa') as CasaLegislativa
  const externalId = c.req.param('id')
  const desde = c.req.query('desde')

  if (casa !== 'CD' && casa !== 'SF') {
    return c.json({ error: 'Casa inválida. Use CD ou SF.' }, 400)
  }

  let acoes: Acao[] =
    casa === 'CD'
      ? await getCamaraDeputadoAcoes(externalId)
      : await getSenadorAcoes(externalId)

  if (desde) {
    acoes = acoes.filter((a) => a.data >= desde)
  }

  return c.json({ acoes, total: acoes.length })
})

export { politicos }

import {
  buildPoliticoId,
  type Acao,
  type Mandatario,
} from '@appolitica/types'
import {
  formatSenadoProcessoAcao,
  formatSenadoVotacaoAcao,
} from '../lib/plain-language.js'
import {
  buildCacheSnapshot,
  getMandatarioByExternalId,
  replaceMandatariosByFonte,
  todayIso,
  updateSyncMetadata,
  type MandatariosCache,
} from '../db/repository.js'

const SENADO_BASE = 'https://legis.senado.leg.br/dadosabertos'
const SYNC_FONTE = 'senado' as const

interface SenadoListaResponse {
  ListaParlamentarEmExercicio?: {
    Parlamentares?: {
      Parlamentar?: SenadoParlamentarLista | SenadoParlamentarLista[]
    }
  }
}

interface SenadoParlamentarLista {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string
    NomeParlamentar: string
    NomeCompletoParlamentar?: string
    SiglaPartidoParlamentar: string
    UfParlamentar: string
    UrlFotoParlamentar?: string
    UrlPaginaParlamentar?: string
    EmailParlamentar?: string
  }
}

interface SenadoDetalheResponse {
  DetalheParlamentar?: {
    Parlamentar?: {
      IdentificacaoParlamentar: SenadoParlamentarLista['IdentificacaoParlamentar']
      DadosBasicosParlamentar?: {
        NomeCompletoParlamentar?: string
        SexoParlamentar?: string
      }
    }
  }
}

function normalizeGenero(value?: string): Mandatario['genero'] {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) return undefined

  if (['f', 'feminino', 'feminina'].includes(normalized)) return 'feminino'
  if (['m', 'masculino', 'masculina'].includes(normalized)) return 'masculino'
  if (['nb', 'nao binario', 'nao_binario', 'não binário', 'nao-binario'].includes(normalized)) return 'nao_binario'

  return 'outro'
}

interface SenadoVotacaoItem {
  codigoSessao?: string
  codigoVotacaoSve?: string
  dataSessao?: string
  sigla?: string
  numero?: string
  ano?: string
  ementa?: string
  voto?: string
}

interface SenadoVotacaoResponse {
  votacoes?: SenadoVotacaoItem[]
}

interface SenadoProcessoItem {
  id?: number
  codigoMateria?: string
  sigla?: string
  numero?: string
  ano?: number
  ementa?: string
  dataApresentacao?: string
}

interface SenadoProcessoResponse {
  processos?: SenadoProcessoItem[]
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

async function fetchSenadoJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const jsonPath = path.endsWith('.json') ? path : `${path}.json`
  const url = new URL(`${SENADO_BASE}${jsonPath}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Senado API ${path}: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

async function fetchSenadorGenero(externalId: string): Promise<Mandatario['genero']> {
  try {
    const json = await fetchSenadoJson<SenadoDetalheResponse>(`/senador/${externalId}`)
    const p = json.DetalheParlamentar?.Parlamentar
    return normalizeGenero(p?.DadosBasicosParlamentar?.SexoParlamentar)
  } catch {
    return undefined
  }
}

function mapSenador(p: SenadoParlamentarLista, genero?: Mandatario['genero']): Mandatario {
  const id = p.IdentificacaoParlamentar
  const externalId = id.CodigoParlamentar
  const email = id.EmailParlamentar?.trim()

  return {
    id: buildPoliticoId('SF', externalId),
    casa: 'SF',
    externalId,
    nome: id.NomeCompletoParlamentar ?? id.NomeParlamentar,
    nomeUrna: id.NomeParlamentar,
    cargo: 'senador',
    partido: id.SiglaPartidoParlamentar,
    uf: id.UfParlamentar,
    foto: id.UrlFotoParlamentar,
    genero,
    contatos: {
      email: email && email.includes('@') ? email : undefined,
      site: id.UrlPaginaParlamentar,
    },
    resumo: `Senador(a) pelo ${id.UfParlamentar} (${id.SiglaPartidoParlamentar}). Dados do Senado Federal.`,
    fonte: 'senado',
  }
}

export async function syncSenadoSenadores(): Promise<MandatariosCache> {
  const json = await fetchSenadoJson<SenadoListaResponse>('/senador/lista/atual')
  const lista = asArray(json.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar)
  const mapped = await Promise.all(
    lista.map(async (p) => {
      const externalId = p.IdentificacaoParlamentar.CodigoParlamentar
      const genero = await fetchSenadorGenero(externalId)
      return mapSenador(p, genero)
    }),
  )
  const mandatarios = Array.from(new Map(mapped.map((m) => [m.id, m])).values())

  await replaceMandatariosByFonte(mandatarios, 'senado')
  await updateSyncMetadata(SYNC_FONTE, {
    ultimaAtualizacao: todayIso(),
    total: mandatarios.length,
    label: 'Senado Federal — Dados Abertos',
  })

  return {
    metadata: {
      ultimaAtualizacao: todayIso(),
      total: mandatarios.length,
      fonte: 'Senado Federal — Dados Abertos',
    },
    mandatarios,
  }
}

export async function getSenadoCache(): Promise<MandatariosCache | null> {
  return buildCacheSnapshot('senado')
}

export async function getSenadoSenadores(): Promise<Mandatario[]> {
  const cache = await getSenadoCache()
  if (cache) return cache.mandatarios
  const synced = await syncSenadoSenadores()
  return synced.mandatarios
}

export async function getSenadorDetail(externalId: string): Promise<Mandatario | null> {
  try {
    const json = await fetchSenadoJson<SenadoDetalheResponse>(`/senador/${externalId}`)
    const p = json.DetalheParlamentar?.Parlamentar
    if (!p) return null

    const id = p.IdentificacaoParlamentar
    const email = id.EmailParlamentar?.trim()
    const genero = normalizeGenero(p.DadosBasicosParlamentar?.SexoParlamentar)

    return {
      id: buildPoliticoId('SF', externalId),
      casa: 'SF',
      externalId,
      nome: p.DadosBasicosParlamentar?.NomeCompletoParlamentar ?? id.NomeParlamentar,
      nomeUrna: id.NomeParlamentar,
      cargo: 'senador',
      partido: id.SiglaPartidoParlamentar,
      uf: id.UfParlamentar,
      foto: id.UrlFotoParlamentar,
      genero,
      contatos: {
        email: email && email.includes('@') ? email : undefined,
        site: id.UrlPaginaParlamentar ?? `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${externalId}`,
      },
      resumo: `Senador(a) pelo ${id.UfParlamentar} (${id.SiglaPartidoParlamentar}). Mandato em exercício.`,
      fonte: 'senado',
    }
  } catch {
    return getMandatarioByExternalId('SF', externalId)
  }
}

export async function getSenadorAcoes(externalId: string, limit = 8): Promise<Acao[]> {
  const acoes: Acao[] = []

  try {
    const votacoes = await fetchSenadoJson<SenadoVotacaoResponse>('/votacao', {
      codigoParlamentar: externalId,
    })

    for (const v of (votacoes.votacoes ?? []).slice(0, Math.min(limit, 5))) {
      const materia =
        v.ementa ??
        [v.sigla, v.numero, v.ano].filter(Boolean).join(' ') ??
        'Matéria legislativa'
      const data = v.dataSessao ?? todayIso()

      acoes.push(
        formatSenadoVotacaoAcao(
          data,
          v.voto ?? 'participou',
          materia,
          v.codigoVotacaoSve
            ? `https://www25.senado.leg.br/web/atividade/votacoes-nominais`
            : undefined,
        ),
      )
    }
  } catch {
    // votacao endpoint may vary
  }

  try {
    const processos = await fetchSenadoJson<SenadoProcessoResponse>('/processo', {
      codigoParlamentarAutor: externalId,
      numdias: '30',
    })

    for (const p of (processos.processos ?? []).slice(0, Math.min(limit, 5))) {
      const ident = [p.sigla, p.numero, p.ano].filter(Boolean).join(' ')
      acoes.push(
        formatSenadoProcessoAcao(
          p.dataApresentacao ?? todayIso(),
          'projeto',
          ident ? `Autoria de ${ident}` : 'Processo legislativo',
          p.ementa ?? 'Processo registrado no Senado Federal.',
          p.id ? `https://legis.senado.leg.br/dadosabertos/processo/${p.id}` : undefined,
        ),
      )
    }
  } catch {
    // processo endpoint may fail
  }

  return acoes
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limit)
}

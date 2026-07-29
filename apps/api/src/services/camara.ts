import {
  buildPoliticoId,
  type Acao,
  type Despesa,
  type DespesasResumo,
  type Mandatario,
} from '@appolitica/types'
import { formatProjetoAcao, formatVotacaoAcao } from '../lib/plain-language.js'
import {
  buildCacheSnapshot,
  getMandatarioByExternalId,
  replaceMandatariosByFonte,
  todayIso,
  updateSyncMetadata,
  type MandatariosCache,
} from '../db/repository.js'

const CAMARA_BASE = 'https://dadosabertos.camara.leg.br/api/v2'
const LEGISLATURA_ATUAL = 57
const SYNC_FONTE = 'camara' as const

interface CamaraListResponse<T> {
  dados: T[]
  links?: { rel: string; href: string }[]
}

interface CamaraDeputado {
  id: number
  uri: string
  nome: string
  siglaPartido: string
  siglaUf: string
  urlFoto: string
  email?: string
  idLegislatura?: number
}

interface CamaraDeputadoDetail extends CamaraDeputado {
  nomeCivil?: string
  ultimoStatus?: {
    nome: string
    nomeEleitoral?: string
    siglaPartido: string
    siglaUf: string
    urlFoto?: string
    email?: string
    gabinete?: { email?: string }
  }
}

interface CamaraProposicao {
  id: number
  uri: string
  siglaTipo: string
  numero: number
  ano: number
  ementa: string
  dataApresentacao: string
}

interface CamaraVotacaoResumo {
  id: string
  uri: string
  data: string
  descricao: string
  descricaoVotacao?: string
}

interface CamaraVotoDeputado {
  deputado_: { id: number }
  tipoVoto: string
}

interface CamaraDespesa {
  ano: number
  mes: number
  tipoDespesa: string
  dataDocumento: string
  valorDocumento: number
  nomeFornecedor?: string
  urlDocumento?: string
}

async function fetchCamara<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${CAMARA_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`Câmara API ${path}: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

async function fetchAllDeputados(): Promise<CamaraDeputado[]> {
  const all: CamaraDeputado[] = []
  let pagina = 1

  while (true) {
    const json = await fetchCamara<CamaraListResponse<CamaraDeputado>>('/deputados', {
      idLegislatura: String(LEGISLATURA_ATUAL),
      itens: '100',
      ordem: 'ASC',
      ordenarPor: 'nome',
      pagina: String(pagina),
    })

    all.push(...json.dados)

    const hasNext = json.links?.some((l) => l.rel === 'next')
    if (!hasNext || json.dados.length === 0) break
    pagina += 1
  }

  return all
}

function mapDeputado(d: CamaraDeputado): Mandatario {
  const externalId = String(d.id)
  const email = d.email?.trim() || undefined

  return {
    id: buildPoliticoId('CD', externalId),
    casa: 'CD',
    externalId,
    nome: d.nome,
    nomeUrna: d.nome,
    cargo: 'deputado_federal',
    partido: d.siglaPartido,
    uf: d.siglaUf,
    foto: d.urlFoto,
    contatos: {
      email: email && email.includes('@') ? email : undefined,
    },
    resumo: `Deputado(a) federal pelo ${d.siglaUf} (${d.siglaPartido}). Dados da Câmara dos Deputados.`,
    fonte: 'camara',
  }
}

export async function syncCamaraDeputados(): Promise<MandatariosCache> {
  const deputados = await fetchAllDeputados()
  const mapped = deputados.map(mapDeputado)
  const mandatarios = Array.from(new Map(mapped.map((m) => [m.id, m])).values())

  await replaceMandatariosByFonte(mandatarios, 'camara')
  await updateSyncMetadata(SYNC_FONTE, {
    ultimaAtualizacao: todayIso(),
    total: mandatarios.length,
    label: 'Câmara dos Deputados — Dados Abertos',
  })

  return {
    metadata: {
      ultimaAtualizacao: todayIso(),
      total: mandatarios.length,
      fonte: 'Câmara dos Deputados — Dados Abertos',
    },
    mandatarios,
  }
}

export async function getCamaraCache(): Promise<MandatariosCache | null> {
  return buildCacheSnapshot('camara')
}

export async function getCamaraDeputados(): Promise<Mandatario[]> {
  const cache = await getCamaraCache()
  if (cache) return cache.mandatarios
  const synced = await syncCamaraDeputados()
  return synced.mandatarios
}

export async function getCamaraDeputadoDetail(externalId: string): Promise<Mandatario | null> {
  try {
    const json = await fetchCamara<{ dados: CamaraDeputadoDetail }>(`/deputados/${externalId}`)
    const d = json.dados
    const status = d.ultimoStatus
    const email =
      status?.email?.trim() ||
      status?.gabinete?.email?.trim() ||
      d.email?.trim() ||
      undefined

    return {
      id: buildPoliticoId('CD', externalId),
      casa: 'CD',
      externalId,
      nome: d.nomeCivil ?? d.nome,
      nomeUrna: status?.nomeEleitoral ?? status?.nome ?? d.nome,
      cargo: 'deputado_federal',
      partido: status?.siglaPartido ?? d.siglaPartido,
      uf: status?.siglaUf ?? d.siglaUf,
      foto: status?.urlFoto ?? d.urlFoto,
      contatos: {
        email: email && email.includes('@') ? email : undefined,
        site: `https://www.camara.leg.br/deputados/${externalId}`,
      },
      resumo: `Deputado(a) federal pelo ${status?.siglaUf ?? d.siglaUf} (${status?.siglaPartido ?? d.siglaPartido}). Mandato na ${LEGISLATURA_ATUAL}ª legislatura.`,
      fonte: 'camara',
    }
  } catch {
    return getMandatarioByExternalId('CD', externalId)
  }
}

export async function getCamaraDeputadoAcoes(
  externalId: string,
  limit = 8,
): Promise<Acao[]> {
  const acoes: Acao[] = []

  try {
    const proposicoes = await fetchCamara<CamaraListResponse<CamaraProposicao>>(
      `/deputados/${externalId}/proposicoes`,
      { itens: String(Math.min(limit, 5)), ordem: 'DESC', ordenarPor: 'id' },
    )

    for (const p of proposicoes.dados) {
      acoes.push(
        formatProjetoAcao(
          p.dataApresentacao,
          p.siglaTipo,
          p.numero,
          p.ano,
          p.ementa,
          `https://www.camara.leg.br/proposicoesWeb/fichafinalizacao?idProposicao=${p.id}`,
        ),
      )
    }
  } catch {
    // proposicoes may fail for some deputies
  }

  try {
    const votacoes = await fetchCamara<CamaraListResponse<CamaraVotacaoResumo>>(
      `/deputados/${externalId}/votacoes`,
      { itens: String(Math.min(limit, 5)), ordem: 'DESC', ordenarPor: 'dataHoraRegistro' },
    )

    for (const v of votacoes.dados) {
      let tipoVoto = 'Participou'
      try {
        const votos = await fetchCamara<CamaraListResponse<CamaraVotoDeputado>>(
          `/votacoes/${v.id}/votos`,
          { itens: '600' },
        )
        const meuVoto = votos.dados.find((item) => String(item.deputado_.id) === externalId)
        if (meuVoto) tipoVoto = meuVoto.tipoVoto
      } catch {
        // fallback to generic participation
      }

      acoes.push(
        formatVotacaoAcao(
          v.data,
          tipoVoto,
          v.descricaoVotacao ?? v.descricao,
          `https://www.camara.leg.br/proposicoesWeb/votacao?votacao=${v.id}`,
        ),
      )
    }
  } catch {
    // votacoes may fail
  }

  return acoes
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limit)
}

function mapCamaraDespesa(d: CamaraDespesa): Despesa {
  return {
    data: d.dataDocumento?.slice(0, 10) ?? `${d.ano}-${String(d.mes).padStart(2, '0')}-01`,
    tipo: d.tipoDespesa,
    descricao: d.tipoDespesa,
    valor: d.valorDocumento ?? 0,
    fornecedor: d.nomeFornecedor,
    fonte: d.urlDocumento,
  }
}

export async function getCamaraDeputadoDespesas(
  externalId: string,
  ano = new Date().getFullYear(),
): Promise<DespesasResumo> {
  const all: CamaraDespesa[] = []
  let pagina = 1

  while (pagina <= 5) {
    const json = await fetchCamara<CamaraListResponse<CamaraDespesa>>(
      `/deputados/${externalId}/despesas`,
      { ano: String(ano), itens: '100', pagina: String(pagina) },
    )

    all.push(...json.dados)

    const hasNext = json.links?.some((l) => l.rel === 'next')
    if (!hasNext || json.dados.length === 0) break
    pagina += 1
  }

  const itens = all
    .map(mapCamaraDespesa)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10)

  const total = all.reduce((sum, d) => sum + (d.valorDocumento ?? 0), 0)

  return {
    ano,
    total,
    fonte: 'camara',
    label: 'Cota parlamentar (CEAP) — Câmara dos Deputados',
    itens,
  }
}

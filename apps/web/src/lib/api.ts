import type { DespesasResumo, Politico, PoliticosListResponse } from '../types/politico'

const API_BASE = '/api'
const FEDERAL_CARGOS = new Set(['deputado_federal', 'senador'])

async function fetchMockPoliticos(): Promise<Politico[]> {
  const res = await fetch('/data/politicos.json')
  if (!res.ok) throw new Error('Não foi possível carregar dados mock.')
  const json = (await res.json()) as { politicos: Politico[] }
  return json.politicos
    .filter((p) => !FEDERAL_CARGOS.has(p.cargo))
    .map((p) => ({ ...p, fonte: p.fonte ?? 'mock' }))
}

async function fetchFederalPoliticos(): Promise<PoliticosListResponse> {
  const res = await fetch(`${API_BASE}/politicos`)
  if (!res.ok) {
    throw new Error(
      'Não foi possível carregar deputados e senadores. Verifique se a API está rodando (pnpm dev).',
    )
  }
  return res.json() as Promise<PoliticosListResponse>
}

export async function fetchPoliticoDetail(politicoId: string): Promise<Politico | null> {
  if (!politicoId.includes(':')) return null

  const res = await fetch(`${API_BASE}/politicos/by-id/${encodeURIComponent(politicoId)}`)
  if (!res.ok) return null
  return res.json() as Promise<Politico>
}

export async function fetchPoliticoAcoes(politicoId: string): Promise<Politico['acoes']> {
  if (!politicoId.includes(':')) return []

  const res = await fetch(
    `${API_BASE}/politicos/by-id/${encodeURIComponent(politicoId)}/acoes`,
  )
  if (!res.ok) return []
  const json = (await res.json()) as { acoes: Politico['acoes'] }
  return json.acoes
}

export async function fetchPoliticoDespesas(
  politicoId: string,
  ano = new Date().getFullYear(),
): Promise<DespesasResumo | null> {
  if (!politicoId.startsWith('CD:')) return null

  const res = await fetch(
    `${API_BASE}/politicos/by-id/${encodeURIComponent(politicoId)}/despesas?ano=${ano}`,
  )
  if (!res.ok) return null
  return res.json() as Promise<DespesasResumo>
}

export async function fetchPortalStatus(): Promise<{
  configured: boolean
  ok: boolean
  message: string
} | null> {
  const res = await fetch(`${API_BASE}/portal/status`)
  if (!res.ok) return null
  return res.json() as Promise<{ configured: boolean; ok: boolean; message: string }>
}

export { fetchMockPoliticos, fetchFederalPoliticos }

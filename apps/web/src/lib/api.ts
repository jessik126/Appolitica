import type { DespesasResumo, Politico, PoliticosListResponse } from '../types/politico'

const API_BASE = '/api'

export async function fetchPoliticos(): Promise<PoliticosListResponse> {
  const res = await fetch(`${API_BASE}/politicos`)
  if (!res.ok) {
    throw new Error(
      'Não foi possível carregar o catálogo. Verifique se a API e o Postgres estão rodando (pnpm infra:up && pnpm dev).',
    )
  }
  return res.json() as Promise<PoliticosListResponse>
}

export async function fetchPoliticoDetail(politicoId: string): Promise<Politico | null> {
  const res = await fetch(`${API_BASE}/politicos/by-id/${encodeURIComponent(politicoId)}`)
  if (!res.ok) return null
  return res.json() as Promise<Politico>
}

export async function fetchPoliticoAcoes(politicoId: string): Promise<Politico['acoes']> {
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

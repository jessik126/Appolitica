import type {
  AuthUser,
  CandidatoCola,
  CargoEleicao2026,
  DespesasResumo,
  MeuAcompanhamento,
  MinhaCola,
  Politico,
  PoliticosListResponse,
} from '../types/politico'

const API_BASE = '/api'

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string }
    return json.error ?? fallback
  } catch {
    return fallback
  }
}

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await apiFetch('/auth/me')
  if (res.status === 401) return null
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível verificar a sessão.'))
  }
  const json = (await res.json()) as { user: AuthUser }
  return json.user
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<AuthUser> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível criar a conta.'))
  }
  const json = (await res.json()) as { user: AuthUser }
  return json.user
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<AuthUser> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível entrar.'))
  }
  const json = (await res.json()) as { user: AuthUser }
  return json.user
}

export async function logoutUser(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' })
}

export async function updateProfile(input: {
  uf?: string
  onboardingStep?: number
  onboardingCompleted?: boolean
}): Promise<AuthUser> {
  const res = await apiFetch('/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível atualizar o perfil.'))
  }
  const json = (await res.json()) as { user: AuthUser }
  return json.user
}

export async function fetchAcompanhamento(): Promise<MeuAcompanhamento[]> {
  const res = await apiFetch('/me/acompanhamento')
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível carregar acompanhamento.'))
  }
  const json = (await res.json()) as { items: MeuAcompanhamento[] }
  return json.items
}

export async function replaceAcompanhamento(items: MeuAcompanhamento[]): Promise<MeuAcompanhamento[]> {
  const res = await apiFetch('/me/acompanhamento', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível salvar acompanhamento.'))
  }
  const json = (await res.json()) as { items: MeuAcompanhamento[] }
  return json.items
}

export async function followPolitico(politicoId: string): Promise<MeuAcompanhamento[]> {
  const res = await apiFetch('/me/acompanhamento', {
    method: 'POST',
    body: JSON.stringify({ politicoId }),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível seguir o político.'))
  }
  const json = (await res.json()) as { items: MeuAcompanhamento[] }
  return json.items
}

export async function unfollowPolitico(politicoId: string): Promise<MeuAcompanhamento[]> {
  const res = await apiFetch(`/me/acompanhamento/${encodeURIComponent(politicoId)}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível deixar de seguir.'))
  }
  const json = (await res.json()) as { items: MeuAcompanhamento[] }
  return json.items
}

export async function updateAcompanhamentoNota(
  politicoId: string,
  nota: string,
): Promise<MeuAcompanhamento[]> {
  const res = await apiFetch(`/me/acompanhamento/${encodeURIComponent(politicoId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ nota }),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível salvar a nota.'))
  }
  const json = (await res.json()) as { items: MeuAcompanhamento[] }
  return json.items
}

export async function fetchCola(): Promise<MinhaCola> {
  const res = await apiFetch('/me/cola')
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível carregar a cola.'))
  }
  const json = (await res.json()) as { cola: MinhaCola }
  return json.cola
}

export async function replaceCola(cola: MinhaCola): Promise<MinhaCola> {
  const res = await apiFetch('/me/cola', {
    method: 'PUT',
    body: JSON.stringify({ cola }),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível salvar a cola.'))
  }
  const json = (await res.json()) as { cola: MinhaCola }
  return json.cola
}

export async function setColaEscolha(
  cargo: CargoEleicao2026,
  escolha: CandidatoCola | null,
): Promise<MinhaCola> {
  const res = await apiFetch(`/me/cola/${encodeURIComponent(cargo)}`, {
    method: 'PUT',
    body: JSON.stringify(escolha),
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'Não foi possível salvar escolha da cola.'))
  }
  const json = (await res.json()) as { cola: MinhaCola }
  return json.cola
}

export async function fetchPoliticos(): Promise<PoliticosListResponse> {
  const res = await apiFetch('/politicos')
  if (!res.ok) {
    throw new Error(
      'Não foi possível carregar o catálogo. Verifique se a API e o Postgres estão rodando (pnpm infra:up && pnpm dev).',
    )
  }
  return res.json() as Promise<PoliticosListResponse>
}

export async function fetchPoliticoDetail(politicoId: string): Promise<Politico | null> {
  const res = await apiFetch(`/politicos/by-id/${encodeURIComponent(politicoId)}`)
  if (!res.ok) return null
  return res.json() as Promise<Politico>
}

export async function fetchPoliticoAcoes(politicoId: string): Promise<Politico['acoes']> {
  const res = await apiFetch(
    `/politicos/by-id/${encodeURIComponent(politicoId)}/acoes`,
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

  const res = await apiFetch(
    `/politicos/by-id/${encodeURIComponent(politicoId)}/despesas?ano=${ano}`,
  )
  if (!res.ok) return null
  return res.json() as Promise<DespesasResumo>
}

export async function fetchPortalStatus(): Promise<{
  configured: boolean
  ok: boolean
  message: string
} | null> {
  const res = await apiFetch('/portal/status')
  if (!res.ok) return null
  return res.json() as Promise<{ configured: boolean; ok: boolean; message: string }>
}

const PORTAL_BASE = 'https://api.portaldatransparencia.gov.br/api-de-dados'

export function isPortalConfigured(): boolean {
  return Boolean(process.env.PORTAL_TRANSPARENCIA_TOKEN?.trim())
}

function getToken(): string {
  const token = process.env.PORTAL_TRANSPARENCIA_TOKEN?.trim()
  if (!token) {
    throw new Error('PORTAL_TRANSPARENCIA_TOKEN não configurado em apps/api/.env')
  }
  return token
}

export async function fetchPortal<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${PORTAL_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url, {
    headers: {
      'chave-api-dados': getToken(),
      Accept: 'application/json',
    },
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error('Token do Portal da Transparência inválido ou expirado.')
  }

  if (res.status === 429) {
    throw new Error('Limite de requisições do Portal da Transparência excedido.')
  }

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(
      `Portal API ${path}: ${res.status}${detail ? ` — ${detail.slice(0, 120)}` : ''}`,
    )
  }

  return res.json() as Promise<T>
}

/** Token is valid when the API does not return 401/403. */
export async function validatePortalConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isPortalConfigured()) {
    return { ok: false, message: 'Token não configurado.' }
  }

  try {
    const url = new URL(`${PORTAL_BASE}/despesas/por-orgao`)
    url.searchParams.set('codigoOrgao', '20000')
    url.searchParams.set('ano', String(new Date().getFullYear() - 1))
    url.searchParams.set('mes', '1')
    url.searchParams.set('pagina', '1')

    const res = await fetch(url, {
      headers: {
        'chave-api-dados': getToken(),
        Accept: 'application/json',
      },
    })

    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: 'Token inválido ou expirado.' }
    }

    if (res.ok) {
      return { ok: true, message: 'Conexão com Portal da Transparência OK.' }
    }

    return {
      ok: true,
      message:
        'Token aceito. Consultas exigem filtros específicos — veja o Swagger do Portal.',
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Falha ao conectar.',
    }
  }
}

export interface PortalDespesaOrgao {
  codigoOrgao?: string
  nomeOrgao?: string
  valorEmpenhado?: number
  valorLiquidado?: number
  valorPago?: number
}

export async function getDespesasPorOrgao(
  codigoOrgao: string,
  ano: string,
  mes: string,
  pagina = 1,
): Promise<PortalDespesaOrgao[]> {
  const data = await fetchPortal<PortalDespesaOrgao[]>('/despesas/por-orgao', {
    codigoOrgao,
    ano,
    mes,
    pagina: String(pagina),
  })
  return Array.isArray(data) ? data : []
}

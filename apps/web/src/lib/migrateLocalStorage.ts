import type { MeuAcompanhamento, MinhaCola } from '../types/politico'
import {
  STORAGE_KEY,
  STORAGE_KEY_ACOMPANHAMENTO,
  STORAGE_KEY_COLA,
  STORAGE_KEY_UF,
} from '../types/politico'
import { replaceAcompanhamento, replaceCola, updateProfile } from './api'

function readLocalAcompanhamento(): MeuAcompanhamento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACOMPANHAMENTO)
    if (raw) {
      const parsed = JSON.parse(raw) as MeuAcompanhamento[]
      if (Array.isArray(parsed)) return parsed
    }
    const legacy = localStorage.getItem(STORAGE_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy) as { politicoId: string; votadoEm: string; nota?: string }[]
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          politicoId: item.politicoId,
          seguidoEm: item.votadoEm,
          nota: item.nota,
        }))
      }
    }
  } catch {
    /* ignore */
  }
  return []
}

function readLocalCola(): MinhaCola {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLA)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MinhaCola
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function readLocalUf(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_UF) ?? ''
  } catch {
    return ''
  }
}

function clearLocalPersonalData() {
  localStorage.removeItem(STORAGE_KEY_ACOMPANHAMENTO)
  localStorage.removeItem(STORAGE_KEY_COLA)
  localStorage.removeItem(STORAGE_KEY_UF)
  localStorage.removeItem(STORAGE_KEY)
}

export async function migrateLocalStorageIfNeeded(
  serverAcompanhamento: MeuAcompanhamento[],
  serverCola: MinhaCola,
  serverUf: string | null,
): Promise<{ acompanhamento: MeuAcompanhamento[]; cola: MinhaCola; uf: string | null }> {
  const localAcompanhamento = readLocalAcompanhamento()
  const localCola = readLocalCola()
  const localUf = readLocalUf()

  const hasLocalData =
    localAcompanhamento.length > 0 ||
    Object.keys(localCola).length > 0 ||
    Boolean(localUf)

  const serverEmpty =
    serverAcompanhamento.length === 0 &&
    Object.keys(serverCola).length === 0 &&
    !serverUf

  if (!hasLocalData || !serverEmpty) {
    return {
      acompanhamento: serverAcompanhamento,
      cola: serverCola,
      uf: serverUf,
    }
  }

  let acompanhamento = serverAcompanhamento
  let cola = serverCola
  let uf = serverUf

  if (localAcompanhamento.length > 0) {
    acompanhamento = await replaceAcompanhamento(localAcompanhamento)
  }

  if (Object.keys(localCola).length > 0) {
    cola = await replaceCola(localCola)
  }

  if (localUf) {
    const user = await updateProfile({ uf: localUf })
    uf = user.uf
  }

  clearLocalPersonalData()
  return { acompanhamento, cola, uf }
}

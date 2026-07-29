import { useCallback, useEffect, useState } from 'react'
import type { CargoEleicao2026, MinhaCola, Politico } from '../types/politico'
import { setColaEscolha } from '../lib/api'
import { ensurePersonalDataBootstrapped } from '../lib/personalDataBootstrap'
import { politicoToColaEscolha } from './useAcompanhamento'

export function useCola(userUf: string | null, ready: boolean) {
  const [cola, setCola] = useState<MinhaCola>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const snapshot = await ensurePersonalDataBootstrapped(userUf)
        if (!cancelled) setCola(snapshot.cola)
      } catch {
        if (!cancelled) setCola({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [ready, userUf])

  const setEscolha = useCallback(async (politico: Politico) => {
    const escolha = politicoToColaEscolha(politico)
    const next = await setColaEscolha(politico.cargo, escolha)
    setCola(next)
  }, [])

  const clearEscolha = useCallback(async (cargo: CargoEleicao2026) => {
    const next = await setColaEscolha(cargo, null)
    setCola(next)
  }, [])

  const totalPreenchidos = Object.keys(cola).length

  return { cola, loading, setEscolha, clearEscolha, totalPreenchidos }
}

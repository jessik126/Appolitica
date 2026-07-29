import { useCallback, useEffect, useState } from 'react'
import type { MeuAcompanhamento, Politico } from '../types/politico'
import {
  followPolitico,
  unfollowPolitico,
  updateAcompanhamentoNota,
} from '../lib/api'
import { ensurePersonalDataBootstrapped } from '../lib/personalDataBootstrap'

export function useAcompanhamento(userUf: string | null, ready: boolean) {
  const [items, setItems] = useState<MeuAcompanhamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const snapshot = await ensurePersonalDataBootstrapped(userUf)
        if (!cancelled) setItems(snapshot.acompanhamento)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [ready, userUf])

  const isFollowing = useCallback(
    (politicoId: string) => items.some((item) => item.politicoId === politicoId),
    [items],
  )

  const follow = useCallback(async (politicoId: string) => {
    const next = await followPolitico(politicoId)
    setItems(next)
  }, [])

  const unfollow = useCallback(async (politicoId: string) => {
    const next = await unfollowPolitico(politicoId)
    setItems(next)
  }, [])

  const toggle = useCallback(
    async (politicoId: string) => {
      if (isFollowing(politicoId)) await unfollow(politicoId)
      else await follow(politicoId)
    },
    [follow, isFollowing, unfollow],
  )

  const updateNota = useCallback(async (politicoId: string, nota: string) => {
    const next = await updateAcompanhamentoNota(politicoId, nota)
    setItems(next)
  }, [])

  return { items, loading, isFollowing, follow, unfollow, toggle, updateNota }
}

/** @deprecated Use useAcompanhamento */
export function useMeusRepresentantes(userUf: string | null, ready: boolean) {
  const { items, isFollowing, toggle, unfollow, updateNota } = useAcompanhamento(userUf, ready)
  return {
    items: items.map((i) => ({
      politicoId: i.politicoId,
      votadoEm: i.seguidoEm,
      nota: i.nota,
    })),
    isSelected: isFollowing,
    toggle,
    remove: unfollow,
    updateNota,
  }
}

export function politicoToColaEscolha(politico: Politico) {
  return {
    cargo: politico.cargo,
    politicoId: politico.id,
    nome: politico.nome,
    nomeUrna: politico.nomeUrna,
    partido: politico.partido,
    uf: politico.uf,
  }
}

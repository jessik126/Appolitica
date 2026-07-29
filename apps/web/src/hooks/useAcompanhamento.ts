import { useCallback, useEffect, useState } from 'react'
import type { MeuAcompanhamento, MeuRepresentante } from '../types/politico'
import { STORAGE_KEY, STORAGE_KEY_ACOMPANHAMENTO } from '../types/politico'

function migrateLegacy(): MeuAcompanhamento[] {
  try {
    const legacy = localStorage.getItem(STORAGE_KEY)
    if (!legacy) return []
    const parsed = JSON.parse(legacy) as MeuRepresentante[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => ({
      politicoId: item.politicoId,
      seguidoEm: item.votadoEm,
      nota: item.nota,
    }))
  } catch {
    return []
  }
}

function readStorage(): MeuAcompanhamento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACOMPANHAMENTO)
    if (!raw) {
      const migrated = migrateLegacy()
      if (migrated.length > 0) {
        localStorage.setItem(STORAGE_KEY_ACOMPANHAMENTO, JSON.stringify(migrated))
      }
      return migrated
    }
    const parsed = JSON.parse(raw) as MeuAcompanhamento[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(items: MeuAcompanhamento[]) {
  localStorage.setItem(STORAGE_KEY_ACOMPANHAMENTO, JSON.stringify(items))
}

export function useAcompanhamento() {
  const [items, setItems] = useState<MeuAcompanhamento[]>(() => readStorage())

  useEffect(() => {
    writeStorage(items)
  }, [items])

  const isFollowing = useCallback(
    (politicoId: string) => items.some((item) => item.politicoId === politicoId),
    [items],
  )

  const follow = useCallback((politicoId: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.politicoId === politicoId)) return prev
      return [
        ...prev,
        { politicoId, seguidoEm: new Date().toISOString().slice(0, 10) },
      ]
    })
  }, [])

  const unfollow = useCallback((politicoId: string) => {
    setItems((prev) => prev.filter((item) => item.politicoId !== politicoId))
  }, [])

  const toggle = useCallback(
    (politicoId: string) => {
      if (isFollowing(politicoId)) unfollow(politicoId)
      else follow(politicoId)
    },
    [follow, isFollowing, unfollow],
  )

  const updateNota = useCallback((politicoId: string, nota: string) => {
    setItems((prev) =>
      prev.map((item) => (item.politicoId === politicoId ? { ...item, nota } : item)),
    )
  }, [])

  return { items, isFollowing, follow, unfollow, toggle, updateNota }
}

/** @deprecated Use useAcompanhamento */
export function useMeusRepresentantes() {
  const { items, isFollowing, toggle, unfollow, updateNota } = useAcompanhamento()
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

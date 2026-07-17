import { useCallback, useEffect, useState } from 'react'
import type { MeuRepresentante } from '../types/politico'
import { STORAGE_KEY } from '../types/politico'

function readStorage(): MeuRepresentante[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MeuRepresentante[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(items: MeuRepresentante[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useMeusRepresentantes() {
  const [items, setItems] = useState<MeuRepresentante[]>(() => readStorage())

  useEffect(() => {
    writeStorage(items)
  }, [items])

  const isSelected = useCallback(
    (politicoId: string) => items.some((item) => item.politicoId === politicoId),
    [items],
  )

  const add = useCallback((politicoId: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.politicoId === politicoId)) return prev
      return [
        ...prev,
        { politicoId, votadoEm: new Date().toISOString().slice(0, 10) },
      ]
    })
  }, [])

  const remove = useCallback((politicoId: string) => {
    setItems((prev) => prev.filter((item) => item.politicoId !== politicoId))
  }, [])

  const toggle = useCallback(
    (politicoId: string) => {
      if (isSelected(politicoId)) remove(politicoId)
      else add(politicoId)
    },
    [add, isSelected, remove],
  )

  const updateNota = useCallback((politicoId: string, nota: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.politicoId === politicoId ? { ...item, nota } : item,
      ),
    )
  }, [])

  return { items, isSelected, add, remove, toggle, updateNota }
}

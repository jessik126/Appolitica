import { useCallback, useEffect, useState } from 'react'
import type { CargoEleicao2026, CandidatoCola, MinhaCola, Politico } from '../types/politico'
import { STORAGE_KEY_COLA } from '../types/politico'

function readStorage(): MinhaCola {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLA)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MinhaCola
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStorage(cola: MinhaCola) {
  localStorage.setItem(STORAGE_KEY_COLA, JSON.stringify(cola))
}

export function useCola() {
  const [cola, setCola] = useState<MinhaCola>(() => readStorage())

  useEffect(() => {
    writeStorage(cola)
  }, [cola])

  const setEscolha = useCallback((politico: Politico) => {
    const escolha: CandidatoCola = {
      cargo: politico.cargo,
      politicoId: politico.id,
      nome: politico.nome,
      nomeUrna: politico.nomeUrna,
      partido: politico.partido,
      uf: politico.uf,
    }
    setCola((prev) => ({ ...prev, [politico.cargo]: escolha }))
  }, [])

  const clearEscolha = useCallback((cargo: CargoEleicao2026) => {
    setCola((prev) => {
      const next = { ...prev }
      delete next[cargo]
      return next
    })
  }, [])

  const totalPreenchidos = Object.keys(cola).length

  return { cola, setEscolha, clearEscolha, totalPreenchidos }
}

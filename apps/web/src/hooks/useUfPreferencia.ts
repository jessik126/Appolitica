import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEY_UF } from '../types/politico'

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

function readStorage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_UF) ?? ''
  } catch {
    return ''
  }
}

export function useUfPreferencia() {
  const [uf, setUfState] = useState(() => readStorage())

  useEffect(() => {
    if (uf) localStorage.setItem(STORAGE_KEY_UF, uf)
  }, [uf])

  const setUf = useCallback((value: string) => {
    setUfState(value)
    if (!value) localStorage.removeItem(STORAGE_KEY_UF)
  }, [])

  return { uf, setUf, ufs: UFS, hasUf: Boolean(uf) }
}

export { UFS }

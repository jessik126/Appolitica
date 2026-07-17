import { useEffect, useState } from 'react'
import type { PoliticosDataset } from '../types/politico'

export function usePoliticos() {
  const [data, setData] = useState<PoliticosDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/data/politicos.json')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os dados dos políticos.')
        return res.json() as Promise<PoliticosDataset>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

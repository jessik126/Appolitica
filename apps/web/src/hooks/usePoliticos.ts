import { useEffect, useState } from 'react'
import type { PoliticosDataset } from '../types/politico'
import { fetchPoliticos } from '../lib/api'

export function usePoliticos() {
  const [data, setData] = useState<PoliticosDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchPoliticos()
        if (cancelled) return

        setData({
          metadata: response.metadata,
          politicos: response.politicos,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

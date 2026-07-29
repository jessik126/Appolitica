import { useEffect, useState } from 'react'
import type { PoliticosDataset } from '../types/politico'
import { fetchFederalPoliticos, fetchMockPoliticos } from '../lib/api'

export function usePoliticos() {
  const [data, setData] = useState<PoliticosDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [federalUnavailable, setFederalUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [mock, federalResult] = await Promise.allSettled([
          fetchMockPoliticos(),
          fetchFederalPoliticos(),
        ])

        if (cancelled) return

        const mockPoliticos = mock.status === 'fulfilled' ? mock.value : []
        if (mock.status === 'rejected') {
          throw mock.reason instanceof Error
            ? mock.reason
            : new Error('Erro ao carregar dados mock.')
        }

        let federalPoliticos: PoliticosDataset['politicos'] = []
        let metadata = {
          eleicao: 2026,
          ultimaAtualizacao: new Date().toISOString().slice(0, 10),
          fonte: 'Mock local (cargos estaduais/presidenciais)',
        }

        if (federalResult.status === 'fulfilled') {
          federalPoliticos = federalResult.value.politicos
          metadata = federalResult.value.metadata
          setFederalUnavailable(false)
        } else {
          setFederalUnavailable(true)
        }

        setData({
          metadata: {
            ...metadata,
            fonte: federalPoliticos.length
              ? `${metadata.fonte} + mock local`
              : metadata.fonte,
          },
          politicos: [...federalPoliticos, ...mockPoliticos],
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

  return { data, loading, error, federalUnavailable }
}

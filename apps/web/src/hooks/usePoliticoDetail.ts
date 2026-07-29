import { useEffect, useState } from 'react'
import type { DespesasResumo, Politico } from '../types/politico'
import { fetchPoliticoAcoes, fetchPoliticoDespesas, fetchPoliticoDetail } from '../lib/api'

export function usePoliticoDetail(politico: Politico | undefined) {
  const [detail, setDetail] = useState<Politico | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!politico?.id.includes(':')) {
      setDetail(null)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchPoliticoDetail(politico.id)
      .then((fetched) => {
        if (!cancelled) setDetail(fetched ?? politico)
      })
      .catch(() => {
        if (!cancelled) setDetail(politico)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [politico])

  const displayed = detail ?? politico

  return { displayed, loading }
}

export function usePoliticoAcoes(politicoId: string | undefined, fallback: Politico['acoes']) {
  const [acoes, setAcoes] = useState(fallback)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!politicoId?.includes(':')) {
      setAcoes(fallback)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchPoliticoAcoes(politicoId)
      .then((items) => {
        if (!cancelled) setAcoes(items.length > 0 ? items : fallback)
      })
      .catch(() => {
        if (!cancelled) setAcoes(fallback)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fallback is mock seed only
  }, [politicoId])

  return { acoes, loading }
}

export function usePoliticoDespesas(politicoId: string | undefined) {
  const [despesas, setDespesas] = useState<DespesasResumo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!politicoId?.startsWith('CD:')) {
      setDespesas(null)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchPoliticoDespesas(politicoId)
      .then((data) => {
        if (!cancelled) setDespesas(data)
      })
      .catch(() => {
        if (!cancelled) setDespesas(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [politicoId])

  return { despesas, loading }
}

import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { MeusRepresentantesList } from './components/MeusRepresentantesList'
import { PoliticoCard } from './components/PoliticoCard'
import { PoliticoDetail } from './components/PoliticoDetail'
import {
  extractFilterOptions,
  filterPoliticos,
  SearchFilters,
} from './components/SearchFilters'
import { TabNav, type TabId } from './components/TabNav'
import { useMeusRepresentantes } from './hooks/useMeusRepresentantes'
import { usePoliticos } from './hooks/usePoliticos'
import type { CargoEleicao2026 } from './types/politico'

function App() {
  const { data, loading, error } = usePoliticos()
  const { items, isSelected, toggle, remove, updateNota } = useMeusRepresentantes()

  const [tab, setTab] = useState<TabId>('inicio')
  const [busca, setBusca] = useState('')
  const [cargo, setCargo] = useState<CargoEleicao2026 | ''>('')
  const [uf, setUf] = useState('')
  const [partido, setPartido] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  const politicos = data?.politicos ?? []

  const filterOptions = useMemo(
    () => extractFilterOptions(politicos),
    [politicos],
  )

  const filtered = useMemo(
    () => filterPoliticos(politicos, busca, cargo, uf, partido),
    [politicos, busca, cargo, uf, partido],
  )

  const detailPolitico = detailId
    ? politicos.find((p) => p.id === detailId)
    : undefined

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-24">
        <TabNav active={tab} onChange={setTab} totalMeus={items.length} />

        {loading && (
          <p className="text-center text-sm text-slate-600">Carregando políticos...</p>
        )}

        {error && (
          <EmptyState
            title="Erro ao carregar dados"
            description={error}
          />
        )}

        {!loading && !error && tab === 'inicio' && (
          <>
            <HeroSection
              totalAcompanhando={items.length}
              onExplorar={() => setTab('explorar')}
              onVerLista={() => setTab('meus')}
            />
            {items.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                  Acompanhando agora
                </h2>
                <div className="space-y-3">
                  {items.slice(0, 3).map((rep) => {
                    const politico = politicos.find((p) => p.id === rep.politicoId)
                    if (!politico) return null
                    return (
                      <PoliticoCard
                        key={rep.politicoId}
                        politico={politico}
                        selected
                        onToggle={() => remove(rep.politicoId)}
                        onViewDetail={() => {
                          setDetailId(rep.politicoId)
                          setTab('explorar')
                        }}
                      />
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && tab === 'explorar' && (
          <>
            <SearchFilters
              busca={busca}
              cargo={cargo}
              uf={uf}
              partido={partido}
              cargos={filterOptions.cargos}
              ufs={filterOptions.ufs}
              partidos={filterOptions.partidos}
              onBuscaChange={setBusca}
              onCargoChange={setCargo}
              onUfChange={setUf}
              onPartidoChange={setPartido}
            />

            {detailPolitico && (
              <PoliticoDetail
                politico={detailPolitico}
                onClose={() => setDetailId(null)}
              />
            )}

            {filtered.length === 0 ? (
              <EmptyState
                title="Nenhum político encontrado"
                description="Tente ajustar os filtros ou o termo de busca."
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'resultado' : 'resultados'}
                </p>
                {filtered.map((politico) => (
                  <PoliticoCard
                    key={politico.id}
                    politico={politico}
                    selected={isSelected(politico.id)}
                    onToggle={() => toggle(politico.id)}
                    onViewDetail={() => setDetailId(politico.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && tab === 'meus' && (
          <MeusRepresentantesList
            representantes={items}
            politicos={politicos}
            onRemove={remove}
            onUpdateNota={updateNota}
            onExplorar={() => setTab('explorar')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Appolitica MVP · Dados mock para validação · Eleição 2026
      </footer>
    </div>
  )
}

export default App

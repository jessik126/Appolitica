import { useEffect, useMemo, useState } from 'react'
import type { AuthUser } from './types/politico'
import { AuthScreen } from './components/auth/AuthScreen'
import { ColaView } from './components/ColaView'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { MeusRepresentantesList } from './components/MeusRepresentantesList'
import { OnboardingWizard } from './components/onboarding/OnboardingWizard'
import { PoliticoCard } from './components/PoliticoCard'
import { PoliticoDetail } from './components/PoliticoDetail'
import {
  extractFilterOptions,
  filterPoliticos,
  SearchFilters,
} from './components/SearchFilters'
import { TabNav, type TabId } from './components/TabNav'
import { useAcompanhamento } from './hooks/useAcompanhamento'
import { useAuth } from './hooks/useAuth'
import { useCola } from './hooks/useCola'
import { usePoliticos } from './hooks/usePoliticos'
import { useUfPreferencia } from './hooks/useUfPreferencia'
import { resetPersonalDataBootstrap } from './lib/personalDataBootstrap'
import type { CargoEleicao2026 } from './types/politico'

function AppShell({
  user,
  setUser,
  onLogout,
}: {
  user: AuthUser
  setUser: (user: AuthUser) => void
  onLogout: () => Promise<void>
}) {
  const personalReady = Boolean(user.onboardingCompleted)
  const { data, loading, error } = usePoliticos()
  const { items, isFollowing, toggle, unfollow, updateNota } = useAcompanhamento(
    user.uf,
    personalReady,
  )
  const { cola, setEscolha, clearEscolha, totalPreenchidos } = useCola(
    user.uf,
    personalReady,
  )
  const { uf } = useUfPreferencia(user)

  const [tab, setTab] = useState<TabId>('inicio')
  const [busca, setBusca] = useState('')
  const [cargo, setCargo] = useState<CargoEleicao2026 | ''>('')
  const [ufFilter, setUfFilter] = useState('')
  const [partido, setPartido] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [colaPickCargo, setColaPickCargo] = useState<CargoEleicao2026 | null>(null)

  const politicos = data?.politicos ?? []

  useEffect(() => {
    if (uf && !ufFilter) setUfFilter(uf)
  }, [uf, ufFilter])

  const filterOptions = useMemo(
    () => extractFilterOptions(politicos),
    [politicos],
  )

  const filtered = useMemo(
    () => filterPoliticos(politicos, busca, cargo, ufFilter, partido),
    [politicos, busca, cargo, ufFilter, partido],
  )

  const colaFiltered = useMemo(() => {
    if (!colaPickCargo) return filtered
    return filterPoliticos(politicos, busca, colaPickCargo, ufFilter, partido)
  }, [politicos, busca, colaPickCargo, ufFilter, partido, filtered])

  const detailPolitico = detailId
    ? politicos.find((p) => p.id === detailId)
    : undefined

  function handlePickForCola(politico: (typeof politicos)[0]) {
    void setEscolha(politico)
    setColaPickCargo(null)
    setTab('cola')
  }

  async function handleLogout() {
    resetPersonalDataBootstrap()
    await onLogout()
  }

  if (!user.onboardingCompleted) {
    return (
      <OnboardingWizard
        user={user}
        onComplete={(nextUser) => {
          resetPersonalDataBootstrap()
          setUser(nextUser)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={user.name} onLogout={() => void handleLogout()} />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-24">
        <TabNav
          active={tab}
          onChange={setTab}
          totalMeus={items.length}
          totalCola={totalPreenchidos}
        />

        {loading && (
          <p className="text-center text-sm text-slate-600">Carregando políticos...</p>
        )}

        {error && (
          <EmptyState title="Erro ao carregar dados" description={error} />
        )}

        {!loading && !error && tab === 'inicio' && (
          <>
            <HeroSection
              totalAcompanhando={items.length}
              totalCola={totalPreenchidos}
              onExplorar={() => setTab('explorar')}
              onVerLista={() => setTab('meus')}
              onMontarCola={() => setTab('cola')}
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
                        onToggle={() => void unfollow(rep.politicoId)}
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

        {!loading && !error && tab === 'cola' && (
          <ColaView
            cola={cola}
            onClear={(c) => void clearEscolha(c)}
            onPick={(c) => {
              setColaPickCargo(c)
              setCargo(c)
              setTab('explorar')
            }}
            onExplorar={() => setTab('explorar')}
          />
        )}

        {!loading && !error && tab === 'explorar' && (
          <>
            {colaPickCargo && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Escolhendo candidato para{' '}
                <strong>{colaPickCargo.replace('_', ' ')}</strong>. Toque em &quot;Na minha
                cola&quot; no card desejado.
                <button
                  type="button"
                  onClick={() => setColaPickCargo(null)}
                  className="ml-2 font-medium underline"
                >
                  Cancelar
                </button>
              </div>
            )}

            <SearchFilters
              busca={busca}
              cargo={cargo}
              uf={ufFilter}
              partido={partido}
              cargos={filterOptions.cargos}
              ufs={filterOptions.ufs}
              partidos={filterOptions.partidos}
              onBuscaChange={setBusca}
              onCargoChange={setCargo}
              onUfChange={setUfFilter}
              onPartidoChange={setPartido}
            />

            {detailPolitico && (
              <PoliticoDetail
                politico={detailPolitico}
                onClose={() => setDetailId(null)}
              />
            )}

            {(colaPickCargo ? colaFiltered : filtered).length === 0 ? (
              <EmptyState
                title="Nenhum político encontrado"
                description="Tente ajustar os filtros ou o termo de busca."
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  {(colaPickCargo ? colaFiltered : filtered).length}{' '}
                  {(colaPickCargo ? colaFiltered : filtered).length === 1
                    ? 'resultado'
                    : 'resultados'}
                </p>
                {(colaPickCargo ? colaFiltered : filtered).map((politico) => (
                  <PoliticoCard
                    key={politico.id}
                    politico={politico}
                    selected={isFollowing(politico.id)}
                    onToggle={() => void toggle(politico.id)}
                    onAddToCola={
                      colaPickCargo
                        ? () => handlePickForCola(politico)
                        : () => {
                            void setEscolha(politico)
                            setTab('cola')
                          }
                    }
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
            onRemove={(id) => void unfollow(id)}
            onUpdateNota={(id, nota) => void updateNota(id, nota)}
            onExplorar={() => setTab('explorar')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Appolitica PoC · Federal via Câmara/Senado · Outros cargos mock · Eleição 2026
      </footer>
    </div>
  )
}

function App() {
  const auth = useAuth()
  const [authLoading, setAuthLoading] = useState(false)

  async function handleLogin(email: string, password: string) {
    setAuthLoading(true)
    auth.setError(null)
    try {
      await auth.login(email, password)
    } catch (err) {
      auth.setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleRegister(name: string, email: string, password: string) {
    setAuthLoading(true)
    auth.setError(null)
    try {
      await auth.register(name, email, password)
    } catch (err) {
      auth.setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setAuthLoading(false)
    }
  }

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Carregando...</p>
      </div>
    )
  }

  if (!auth.user) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={auth.error}
        loading={authLoading}
      />
    )
  }

  return (
    <AppShell
      user={auth.user}
      setUser={auth.setUser}
      onLogout={auth.logout}
    />
  )
}

export default App

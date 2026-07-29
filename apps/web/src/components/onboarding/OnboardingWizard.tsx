import { useState } from 'react'
import type { AuthUser } from '../../types/politico'
import { UFS } from '../../hooks/useUfPreferencia'
import { updateProfile } from '../../lib/api'

const FEATURE_STEPS = [
  {
    title: 'Monte sua Cola de Votação',
    description:
      'Crie e salve suas escolhas para cada cargo de forma simples e rápida durante as eleições.',
  },
  {
    title: 'Acompanhe Políticos',
    description:
      'Siga os políticos que você elegeu ou tem interesse e fique por dentro de suas atividades.',
  },
  {
    title: 'Receba Atualizações',
    description:
      'Fique informado sobre notícias, mudanças de partido e projetos de lei dos políticos que você segue.',
  },
  {
    title: 'Compare seu Histórico',
    description:
      'Analise seus votos de eleições passadas e veja estatísticas sobre suas escolhas políticas ao longo do tempo.',
  },
] as const

interface OnboardingWizardProps {
  user: AuthUser
  onComplete: (user: AuthUser) => void
}

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const uiStep = user.onboardingStep + 1
  const [uf, setUf] = useState(user.uf ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUfContinue() {
    if (!uf) {
      setError('Selecione seu estado para continuar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const nextUser = await updateProfile({ uf, onboardingStep: 1 })
      onComplete(nextUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar região.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFeatureContinue() {
    const nextStep = user.onboardingStep + 1
    setLoading(true)
    setError(null)
    try {
      if (nextStep >= 5) {
        const nextUser = await updateProfile({ onboardingCompleted: true })
        onComplete(nextUser)
      } else {
        const nextUser = await updateProfile({ onboardingStep: nextStep })
        onComplete(nextUser)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avançar.')
    } finally {
      setLoading(false)
    }
  }

  const featureIndex = user.onboardingStep - 1
  const feature = FEATURE_STEPS[featureIndex]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            A
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">AppoliticA</p>
            <p className="text-xs text-slate-500">Configuração inicial</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${
                step <= uiStep ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {uiStep === 1 ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Passo 1 de 5
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Informe sua região</h1>
              <p className="mt-2 text-sm text-slate-600">
                Escolha seu estado para ver deputados federais e senadores da sua região primeiro.
              </p>
              <select
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                className="mt-6 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              >
                <option value="">Selecione seu estado</option>
                {UFS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </>
          ) : feature ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Passo {uiStep} de 5
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">{feature.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </>
          ) : null}

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (uiStep === 1) void handleUfContinue()
              else void handleFeatureContinue()
            }}
            className="mt-8 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading
              ? 'Salvando...'
              : uiStep === 5
                ? 'Começar a usar'
                : 'Continuar'}
          </button>
        </div>
      </main>
    </div>
  )
}

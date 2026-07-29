import type {
  CargoEleicao2026,
  CandidatoCola,
  MinhaCola,
} from '../types/politico'
import { CARGO_LABELS, COLA_CARGOS } from '../types/politico'
import { EmptyState } from './EmptyState'

interface ColaViewProps {
  cola: MinhaCola
  onClear: (cargo: CargoEleicao2026) => void
  onPick: (cargo: CargoEleicao2026) => void
  onExplorar: () => void
}

function ColaSlot({
  cargo,
  escolha,
  onClear,
  onPick,
}: {
  cargo: CargoEleicao2026
  escolha?: CandidatoCola
  onClear: () => void
  onPick: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {CARGO_LABELS[cargo]}
          </p>
          {escolha ? (
            <>
              <p className="mt-1 font-semibold text-slate-900">{escolha.nomeUrna}</p>
              <p className="text-sm text-slate-600">
                {escolha.partido} · {escolha.uf}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Nenhuma escolha ainda</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onPick}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            {escolha ? 'Trocar' : 'Escolher'}
          </button>
          {escolha && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ColaView({ cola, onClear, onPick, onExplorar }: ColaViewProps) {
  const preenchidos = COLA_CARGOS.filter((c) => cola[c]).length

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Minha cola de votação</h2>
        <p className="mt-1 text-sm text-slate-600">
          Escolha um candidato para cada cargo. Federal usa dados reais quando disponível;
          demais cargos usam catálogo mock até integração com TSE.
        </p>
        <p className="mt-3 text-sm text-emerald-800">
          {preenchidos} de {COLA_CARGOS.length} cargos preenchidos
        </p>
      </section>

      {preenchidos === 0 && (
        <EmptyState
          title="Sua cola está vazia"
          description="Comece escolhendo quem você pretende votar em cada cargo."
          actionLabel="Explorar candidatos"
          onAction={onExplorar}
        />
      )}

      <div className="space-y-3">
        {COLA_CARGOS.map((cargo) => (
          <ColaSlot
            key={cargo}
            cargo={cargo}
            escolha={cola[cargo]}
            onClear={() => onClear(cargo)}
            onPick={() => onPick(cargo)}
          />
        ))}
      </div>
    </div>
  )
}

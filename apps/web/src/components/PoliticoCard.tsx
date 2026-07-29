import type { Politico } from '../types/politico'
import { CARGO_LABELS } from '../types/politico'

interface PoliticoCardProps {
  politico: Politico
  selected: boolean
  onToggle: () => void
  onViewDetail?: () => void
}

function PoliticoAvatar({ politico }: { politico: Politico }) {
  if (politico.foto) {
    return (
      <img
        src={politico.foto}
        alt=""
        className="h-14 w-14 rounded-full object-cover bg-slate-200"
      />
    )
  }
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
      {politico.nomeUrna.charAt(0)}
    </div>
  )
}

export function PoliticoCard({
  politico,
  selected,
  onToggle,
  onViewDetail,
}: PoliticoCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <PoliticoAvatar politico={politico} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{politico.nomeUrna}</h3>
          <p className="text-sm text-slate-600">{CARGO_LABELS[politico.cargo]}</p>
          <p className="text-sm text-slate-500">
            {politico.partido} · {politico.uf}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{politico.resumo}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            selected
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
        >
          {selected ? 'Remover da minha lista' : 'Votei neste'}
        </button>
        {onViewDetail && (
          <button
            type="button"
            onClick={onViewDetail}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ver detalhes
          </button>
        )}
      </div>
    </article>
  )
}

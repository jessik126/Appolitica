import type { CargoEleicao2026, GeneroPolitico, Politico } from '../types/politico'
import { CARGO_LABELS } from '../types/politico'

const GENERO_LABELS: Record<GeneroPolitico, string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  nao_binario: 'Não binário',
  outro: 'Outro',
}

interface SearchFiltersProps {
  busca: string
  cargo: CargoEleicao2026 | ''
  uf: string
  partido: string
  genero: GeneroPolitico | ''
  cargos: CargoEleicao2026[]
  ufs: string[]
  partidos: string[]
  generos: GeneroPolitico[]
  onBuscaChange: (value: string) => void
  onCargoChange: (value: CargoEleicao2026 | '') => void
  onUfChange: (value: string) => void
  onPartidoChange: (value: string) => void
  onGeneroChange: (value: GeneroPolitico | '') => void
}

export function SearchFilters({
  busca,
  cargo,
  uf,
  partido,
  genero,
  cargos,
  ufs,
  partidos,
  generos,
  onBuscaChange,
  onCargoChange,
  onUfChange,
  onPartidoChange,
  onGeneroChange,
}: SearchFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="search"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <select
          value={cargo}
          onChange={(e) => onCargoChange(e.target.value as CargoEleicao2026 | '')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Todos os cargos</option>
          {cargos.map((c) => (
            <option key={c} value={c}>
              {CARGO_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={uf}
          onChange={(e) => onUfChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Todos os estados</option>
          {ufs.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={partido}
          onChange={(e) => onPartidoChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Todos os partidos</option>
          {partidos.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={genero}
          onChange={(e) => onGeneroChange(e.target.value as GeneroPolitico | '')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Todos os gêneros</option>
          {generos.map((g) => (
            <option key={g} value={g}>
              {GENERO_LABELS[g]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function filterPoliticos(
  politicos: Politico[],
  busca: string,
  cargo: CargoEleicao2026 | '',
  uf: string,
  partido: string,
  genero: GeneroPolitico | '',
): Politico[] {
  const term = busca.trim().toLowerCase()
  return politicos.filter((p) => {
    if (cargo && p.cargo !== cargo) return false
    if (uf && p.uf !== uf) return false
    if (partido && p.partido !== partido) return false
    if (genero && p.genero !== genero) return false
    if (!term) return true
    return (
      p.nome.toLowerCase().includes(term) ||
      p.nomeUrna.toLowerCase().includes(term) ||
      p.partido.toLowerCase().includes(term)
    )
  })
}

export function extractFilterOptions(politicos: Politico[]) {
  const cargos = [...new Set(politicos.map((p) => p.cargo))].sort()
  const ufs = [...new Set(politicos.map((p) => p.uf))].sort()
  const partidos = [...new Set(politicos.map((p) => p.partido))].sort()
  const generos = [...new Set(politicos.flatMap((p) => (p.genero ? [p.genero] : [])))]
  return { cargos, ufs, partidos, generos }
}

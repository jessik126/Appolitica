export type TabId = 'inicio' | 'cola' | 'explorar' | 'meus'

interface TabNavProps {
  active: TabId
  onChange: (tab: TabId) => void
  totalMeus: number
  totalCola: number
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'inicio', label: 'Início' },
  { id: 'cola', label: 'Cola' },
  { id: 'explorar', label: 'Explorar' },
  { id: 'meus', label: 'Meus' },
]

export function TabNav({ active, onChange, totalMeus, totalCola }: TabNavProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 flex-1 rounded-lg px-2 py-2 text-sm font-medium transition sm:px-3 ${
            active === tab.id
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab.label}
          {tab.id === 'meus' && totalMeus > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs text-white">
              {totalMeus}
            </span>
          )}
          {tab.id === 'cola' && totalCola > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1.5 text-xs text-white">
              {totalCola}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}

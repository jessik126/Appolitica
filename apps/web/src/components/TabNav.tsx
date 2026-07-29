export type TabId = 'inicio' | 'explorar' | 'meus'

interface TabNavProps {
  active: TabId
  onChange: (tab: TabId) => void
  totalMeus: number
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'inicio', label: 'Início' },
  { id: 'explorar', label: 'Explorar' },
  { id: 'meus', label: 'Meus' },
]

export function TabNav({ active, onChange, totalMeus }: TabNavProps) {
  return (
    <nav className="flex gap-1 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
        </button>
      ))}
    </nav>
  )
}

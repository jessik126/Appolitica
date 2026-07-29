interface HeaderProps {
  userName?: string
  onLogout?: () => void
}

export function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            A
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 leading-tight">Appolitica</p>
            <p className="text-xs text-slate-500">Eleição 2026</p>
          </div>
        </div>
        {userName && onLogout && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{userName}</span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

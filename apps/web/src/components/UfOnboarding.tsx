interface UfOnboardingProps {
  uf: string
  ufs: string[]
  onUfChange: (uf: string) => void
}

export function UfOnboarding({ uf, ufs, onUfChange }: UfOnboardingProps) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <h2 className="text-sm font-semibold text-emerald-900">Personalize por estado</h2>
      <p className="mt-1 text-sm text-emerald-800">
        Informe seu UF para ver deputados federais e senadores da sua região primeiro.
      </p>
      <select
        value={uf}
        onChange={(e) => onUfChange(e.target.value)}
        className="mt-3 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 sm:w-auto"
      >
        <option value="">Selecione seu estado</option>
        {ufs.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </section>
  )
}

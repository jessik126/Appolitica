interface HeroSectionProps {
  totalAcompanhando: number
  totalCola: number
  onExplorar: () => void
  onVerLista: () => void
  onMontarCola: () => void
}

export function HeroSection({
  totalAcompanhando,
  totalCola,
  onExplorar,
  onVerLista,
  onMontarCola,
}: HeroSectionProps) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-800 to-slate-900 px-6 py-8 text-white shadow-lg">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
        Seu painel cívico
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
        Lembre quem você escolheu. Acompanhe. Cobre.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
        Monte sua cola de votação, acompanhe deputados e senadores com dados reais da
        Câmara e do Senado, e cobre resultados com informação de fonte.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onMontarCola}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          Montar minha cola
        </button>
        <button
          type="button"
          onClick={onExplorar}
          className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Explorar políticos
        </button>
        <button
          type="button"
          onClick={onVerLista}
          className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Meus acompanhamentos
        </button>
      </div>

      <p className="mt-6 text-sm text-emerald-100">
        Cola: <span className="font-bold text-white">{totalCola}</span> cargos · Acompanhando{' '}
        <span className="font-bold text-white">{totalAcompanhando}</span>{' '}
        {totalAcompanhando === 1 ? 'representante' : 'representantes'}.
      </p>
    </section>
  )
}

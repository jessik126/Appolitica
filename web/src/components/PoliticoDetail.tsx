import type { Politico } from '../types/politico'
import { CARGO_LABELS, TIPO_ACAO_LABELS } from '../types/politico'

interface PoliticoDetailProps {
  politico: Politico
  nota?: string
  onNotaChange?: (nota: string) => void
  onClose?: () => void
  compact?: boolean
}

function buildMailto(politico: Politico): string | null {
  if (!politico.contatos.email) return null
  const subject = encodeURIComponent(
    `Cidadão(ã) cobrando transparência — ${politico.nomeUrna}`,
  )
  const body = encodeURIComponent(
    `Olá, ${politico.nomeUrna},\n\nSou eleitor(a) do ${politico.uf} e votei em você na eleição de 2026. Gostaria de saber sua posição sobre:\n\n[descreva sua demanda aqui]\n\nAtenciosamente,`,
  )
  return `mailto:${politico.contatos.email}?subject=${subject}&body=${body}`
}

function socialUrl(handle: string, platform: 'instagram' | 'twitter'): string {
  const clean = handle.replace('@', '')
  return platform === 'instagram'
    ? `https://instagram.com/${clean}`
    : `https://x.com/${clean}`
}

export function PoliticoDetail({
  politico,
  nota,
  onNotaChange,
  onClose,
  compact = false,
}: PoliticoDetailProps) {
  const mailto = buildMailto(politico)

  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${compact ? 'p-4' : 'p-5 shadow-sm'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{politico.nomeUrna}</h3>
          <p className="text-sm text-slate-600">{politico.nome}</p>
          <p className="mt-1 text-sm text-slate-500">
            {CARGO_LABELS[politico.cargo]} · {politico.partido} · {politico.uf}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">{politico.resumo}</p>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contatos
        </h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {politico.contatos.email && (
            <a
              href={`mailto:${politico.contatos.email}`}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              E-mail
            </a>
          )}
          {politico.contatos.site && (
            <a
              href={politico.contatos.site}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              Site
            </a>
          )}
          {politico.contatos.instagram && (
            <a
              href={socialUrl(politico.contatos.instagram, 'instagram')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              Instagram
            </a>
          )}
          {politico.contatos.twitter && (
            <a
              href={socialUrl(politico.contatos.twitter, 'twitter')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              X / Twitter
            </a>
          )}
        </div>
        {mailto && (
          <a
            href={mailto}
            className="mt-3 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Cobrar por e-mail
          </a>
        )}
      </div>

      {onNotaChange && (
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Minha nota
          </label>
          <textarea
            value={nota ?? ''}
            onChange={(e) => onNotaChange(e.target.value)}
            placeholder="Por que votei nesta pessoa? O que espero dela?"
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      )}

      {politico.acoes.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Últimas ações
          </h4>
          <ul className="mt-2 space-y-3">
            {politico.acoes.map((acao, index) => (
              <li
                key={`${acao.data}-${index}`}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{acao.data}</span>
                  <span className="rounded bg-white px-1.5 py-0.5 font-medium text-emerald-800">
                    {TIPO_ACAO_LABELS[acao.tipo]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-800">{acao.titulo}</p>
                <p className="mt-1 text-sm text-slate-600">{acao.descricao}</p>
                {acao.fonte && (
                  <a
                    href={acao.fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-emerald-700 hover:underline"
                  >
                    Ver fonte
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

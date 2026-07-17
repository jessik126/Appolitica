import { useState } from 'react'
import type { MeuRepresentante, Politico } from '../types/politico'
import { EmptyState } from './EmptyState'
import { PoliticoCard } from './PoliticoCard'
import { PoliticoDetail } from './PoliticoDetail'

interface MeusRepresentantesListProps {
  representantes: MeuRepresentante[]
  politicos: Politico[]
  onRemove: (politicoId: string) => void
  onUpdateNota: (politicoId: string, nota: string) => void
  onExplorar: () => void
}

export function MeusRepresentantesList({
  representantes,
  politicos,
  onRemove,
  onUpdateNota,
  onExplorar,
}: MeusRepresentantesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const enriched = representantes
    .map((rep) => ({
      rep,
      politico: politicos.find((p) => p.id === rep.politicoId),
    }))
    .filter((item): item is { rep: MeuRepresentante; politico: Politico } =>
      Boolean(item.politico),
    )

  if (enriched.length === 0) {
    return (
      <EmptyState
        title="Você ainda não marcou ninguém que votou"
        description="Explore a lista de políticos e marque quem recebeu seu voto na eleição de 2026."
        actionLabel="Explorar políticos"
        onAction={onExplorar}
      />
    )
  }

  return (
    <div className="space-y-4">
      {enriched.map(({ rep, politico }) => (
        <div key={rep.politicoId} className="space-y-3">
          <PoliticoCard
            politico={politico}
            selected
            onToggle={() => onRemove(rep.politicoId)}
            onViewDetail={() =>
              setExpandedId(expandedId === rep.politicoId ? null : rep.politicoId)
            }
          />
          {expandedId === rep.politicoId && (
            <PoliticoDetail
              politico={politico}
              nota={rep.nota}
              onNotaChange={(nota) => onUpdateNota(rep.politicoId, nota)}
              compact
            />
          )}
        </div>
      ))}
    </div>
  )
}

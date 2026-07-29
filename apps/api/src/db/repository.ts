import type {
  Acao,
  CasaLegislativa,
  ContatosPolitico,
  FontePolitico,
  Mandatario,
} from '@appolitica/types'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from './client.js'
import { acoes, mandatarios, syncMetadata } from './schema.js'

export interface MandatariosCache {
  metadata: {
    ultimaAtualizacao: string
    total: number
    fonte: string
  }
  mandatarios: Mandatario[]
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function rowToMandatario(row: typeof mandatarios.$inferSelect): Mandatario {
  return {
    id: row.id,
    casa: (row.casa as CasaLegislativa | null) ?? undefined,
    externalId: row.externalId ?? undefined,
    nome: row.nome,
    nomeUrna: row.nomeUrna,
    cargo: row.cargo as Mandatario['cargo'],
    partido: row.partido,
    uf: row.uf,
    foto: row.foto ?? undefined,
    contatos: (row.contatos ?? {}) as ContatosPolitico,
    resumo: row.resumo,
    fonte: row.fonte as FontePolitico,
  }
}

function rowToAcao(row: typeof acoes.$inferSelect): Acao {
  return {
    data: row.data,
    tipo: row.tipo as Acao['tipo'],
    titulo: row.titulo,
    descricao: row.descricao,
    fonte: row.fonte ?? undefined,
  }
}

export async function upsertMandatarios(
  items: Mandatario[],
  fonte: FontePolitico,
): Promise<void> {
  const db = getDb()
  const now = new Date()

  for (const item of items) {
    await db
      .insert(mandatarios)
      .values({
        id: item.id,
        casa: item.casa ?? null,
        externalId: item.externalId ?? null,
        nome: item.nome,
        nomeUrna: item.nomeUrna,
        cargo: item.cargo,
        partido: item.partido,
        uf: item.uf,
        foto: item.foto ?? null,
        contatos: item.contatos ?? {},
        resumo: item.resumo,
        fonte,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: mandatarios.id,
        set: {
          casa: item.casa ?? null,
          externalId: item.externalId ?? null,
          nome: item.nome,
          nomeUrna: item.nomeUrna,
          cargo: item.cargo,
          partido: item.partido,
          uf: item.uf,
          foto: item.foto ?? null,
          contatos: item.contatos ?? {},
          resumo: item.resumo,
          fonte,
          updatedAt: now,
        },
      })
  }
}

export async function deleteMandatariosByFonte(fonte: FontePolitico): Promise<void> {
  const db = getDb()
  await db.delete(mandatarios).where(eq(mandatarios.fonte, fonte))
}

export async function replaceMandatariosByFonte(
  items: Mandatario[],
  fonte: FontePolitico,
): Promise<void> {
  const db = getDb()
  const deduped = Array.from(new Map(items.map((item) => [item.id, item])).values())
  const chunkSize = 200

  await db.transaction(async (tx) => {
    await tx.delete(mandatarios).where(eq(mandatarios.fonte, fonte))
    if (deduped.length === 0) return

    for (let i = 0; i < deduped.length; i += chunkSize) {
      const chunk = deduped.slice(i, i + chunkSize)
      await tx.insert(mandatarios).values(
        chunk.map((item) => ({
          id: item.id,
          casa: item.casa ?? null,
          externalId: item.externalId ?? null,
          nome: item.nome,
          nomeUrna: item.nomeUrna,
          cargo: item.cargo,
          partido: item.partido,
          uf: item.uf,
          foto: item.foto ?? null,
          contatos: item.contatos ?? {},
          resumo: item.resumo,
          fonte,
          updatedAt: new Date(),
        })),
      )
    }
  })
}

export async function updateSyncMetadata(
  fonte: string,
  metadata: { ultimaAtualizacao: string; total: number; label: string },
): Promise<void> {
  const db = getDb()
  await db
    .insert(syncMetadata)
    .values({
      fonte,
      ultimaAtualizacao: metadata.ultimaAtualizacao,
      total: String(metadata.total),
      label: metadata.label,
    })
    .onConflictDoUpdate({
      target: syncMetadata.fonte,
      set: {
        ultimaAtualizacao: metadata.ultimaAtualizacao,
        total: String(metadata.total),
        label: metadata.label,
      },
    })
}

export async function getSyncMetadata(fonte: string): Promise<MandatariosCache['metadata'] | null> {
  const db = getDb()
  const row = await db.query.syncMetadata.findFirst({
    where: eq(syncMetadata.fonte, fonte),
  })

  if (!row) return null

  return {
    ultimaAtualizacao: row.ultimaAtualizacao,
    total: Number(row.total),
    fonte: row.label,
  }
}

export async function getMandatariosByFonte(fonte: FontePolitico): Promise<Mandatario[]> {
  const db = getDb()
  const rows = await db.query.mandatarios.findMany({
    where: eq(mandatarios.fonte, fonte),
  })
  return rows.map(rowToMandatario)
}

export async function getMandatarioById(id: string): Promise<Mandatario | null> {
  const db = getDb()
  const row = await db.query.mandatarios.findFirst({
    where: eq(mandatarios.id, id),
  })
  return row ? rowToMandatario(row) : null
}

export async function getMandatarioByExternalId(
  casa: CasaLegislativa,
  externalId: string,
): Promise<Mandatario | null> {
  const db = getDb()
  const row = await db.query.mandatarios.findFirst({
    where: and(eq(mandatarios.casa, casa), eq(mandatarios.externalId, externalId)),
  })
  return row ? rowToMandatario(row) : null
}

export async function listMandatarios(params?: {
  casa?: string
  uf?: string
  partido?: string
  q?: string
  fonte?: FontePolitico
}): Promise<Mandatario[]> {
  const db = getDb()
  const conditions = []

  if (params?.fonte) {
    conditions.push(eq(mandatarios.fonte, params.fonte))
  }
  if (params?.casa) {
    conditions.push(eq(mandatarios.casa, params.casa))
  }
  if (params?.uf) {
    conditions.push(eq(mandatarios.uf, params.uf))
  }
  if (params?.partido) {
    conditions.push(eq(mandatarios.partido, params.partido))
  }
  if (params?.q?.trim()) {
    const term = `%${params.q.trim()}%`
    conditions.push(
      or(
        ilike(mandatarios.nome, term),
        ilike(mandatarios.nomeUrna, term),
        ilike(mandatarios.partido, term),
      )!,
    )
  }

  const rows = await db.query.mandatarios.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (table, { asc }) => [asc(table.nome)],
  })

  return rows.map(rowToMandatario)
}

export async function countMandatariosByFonte(fonte: FontePolitico): Promise<number> {
  const db = getDb()
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mandatarios)
    .where(eq(mandatarios.fonte, fonte))
  return result[0]?.count ?? 0
}

export async function replaceAcoesForPolitico(
  politicoId: string,
  items: Acao[],
): Promise<void> {
  const db = getDb()
  await db.transaction(async (tx) => {
    await tx.delete(acoes).where(eq(acoes.politicoId, politicoId))
    if (items.length === 0) return

    await tx.insert(acoes).values(
      items.map((item) => ({
        politicoId,
        data: item.data,
        tipo: item.tipo,
        titulo: item.titulo,
        descricao: item.descricao,
        fonte: item.fonte ?? null,
      })),
    )
  })
}

export async function getAcoesByPoliticoId(politicoId: string): Promise<Acao[]> {
  const db = getDb()
  const rows = await db.query.acoes.findMany({
    where: eq(acoes.politicoId, politicoId),
    orderBy: (table, { desc }) => [desc(table.data)],
  })
  return rows.map(rowToAcao)
}

export async function buildCacheSnapshot(fonte: FontePolitico): Promise<MandatariosCache | null> {
  const metadata = await getSyncMetadata(fonte)
  const list = await getMandatariosByFonte(fonte)

  if (list.length === 0 && !metadata) return null

  return {
    metadata: metadata ?? {
      ultimaAtualizacao: todayIso(),
      total: list.length,
      fonte,
    },
    mandatarios: list,
  }
}

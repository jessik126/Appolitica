import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const mandatarios = pgTable(
  'mandatarios',
  {
    id: text('id').primaryKey(),
    casa: text('casa'),
    externalId: text('external_id'),
    nome: text('nome').notNull(),
    nomeUrna: text('nome_urna').notNull(),
    cargo: text('cargo').notNull(),
    partido: text('partido').notNull(),
    uf: text('uf').notNull(),
    foto: text('foto'),
    contatos: jsonb('contatos').notNull().$type<{
      email?: string
      site?: string
      instagram?: string
      twitter?: string
    }>(),
    resumo: text('resumo').notNull(),
    fonte: text('fonte').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('mandatarios_casa_idx').on(table.casa),
    index('mandatarios_uf_idx').on(table.uf),
    index('mandatarios_partido_idx').on(table.partido),
    index('mandatarios_cargo_idx').on(table.cargo),
    index('mandatarios_fonte_idx').on(table.fonte),
  ],
)

export const acoes = pgTable(
  'acoes',
  {
    id: serial('id').primaryKey(),
    politicoId: text('politico_id')
      .notNull()
      .references(() => mandatarios.id, { onDelete: 'cascade' }),
    data: text('data').notNull(),
    tipo: text('tipo').notNull(),
    titulo: text('titulo').notNull(),
    descricao: text('descricao').notNull(),
    fonte: text('fonte'),
  },
  (table) => [index('acoes_politico_id_idx').on(table.politicoId)],
)

export const syncMetadata = pgTable('sync_metadata', {
  fonte: text('fonte').primaryKey(),
  ultimaAtualizacao: text('ultima_atualizacao').notNull(),
  total: text('total').notNull(),
  label: text('label').notNull(),
})

export type MandatarioRow = typeof mandatarios.$inferSelect
export type AcaoRow = typeof acoes.$inferSelect
export type SyncMetadataRow = typeof syncMetadata.$inferSelect

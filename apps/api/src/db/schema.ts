import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
    genero: text('genero'),
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

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    uf: text('uf'),
    onboardingStep: integer('onboarding_step').notNull().default(0),
    onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('users_email_idx').on(table.email)],
)

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_hash_idx').on(table.tokenHash),
  ],
)

export const userAcompanhamentos = pgTable(
  'user_acompanhamentos',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    politicoId: text('politico_id')
      .notNull()
      .references(() => mandatarios.id, { onDelete: 'cascade' }),
    seguidoEm: text('seguido_em').notNull(),
    nota: text('nota'),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.politicoId] }),
    index('user_acompanhamentos_user_id_idx').on(table.userId),
  ],
)

export const userCola = pgTable(
  'user_cola',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cargo: text('cargo').notNull(),
    politicoId: text('politico_id').notNull(),
    nome: text('nome').notNull(),
    nomeUrna: text('nome_urna').notNull(),
    partido: text('partido').notNull(),
    uf: text('uf').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cargo] }),
    index('user_cola_user_id_idx').on(table.userId),
  ],
)

export type MandatarioRow = typeof mandatarios.$inferSelect
export type AcaoRow = typeof acoes.$inferSelect
export type SyncMetadataRow = typeof syncMetadata.$inferSelect
export type UserRow = typeof users.$inferSelect
export type SessionRow = typeof sessions.$inferSelect
export type UserAcompanhamentoRow = typeof userAcompanhamentos.$inferSelect
export type UserColaRow = typeof userCola.$inferSelect

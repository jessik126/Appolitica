import type { CandidatoCola, CargoEleicao2026, MeuAcompanhamento, MinhaCola } from '@appolitica/types'
import { COLA_CARGOS } from '@appolitica/types'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { userAcompanhamentos, userCola, users } from '../db/schema.js'
import { toAuthUser } from '../lib/user.js'
import type { AuthVariables } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

const UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])

export const me = new Hono<{ Variables: AuthVariables }>()

me.use('*', requireAuth)

me.patch('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{
    uf?: string
    onboardingStep?: number
    onboardingCompleted?: boolean
  }>()

  const updates: Partial<{
    uf: string | null
    onboardingStep: number
    onboardingCompletedAt: Date | null
    updatedAt: Date
  }> = {
    updatedAt: new Date(),
  }

  if (body.uf !== undefined) {
    if (body.uf && !UFS.has(body.uf)) {
      return c.json({ error: 'UF inválida.' }, 400)
    }
    updates.uf = body.uf || null
  }

  if (body.onboardingStep !== undefined) {
    if (!Number.isInteger(body.onboardingStep) || body.onboardingStep < 0 || body.onboardingStep > 5) {
      return c.json({ error: 'Passo de onboarding inválido.' }, 400)
    }
    updates.onboardingStep = body.onboardingStep
  }

  if (body.onboardingCompleted === true) {
    updates.onboardingCompletedAt = new Date()
    updates.onboardingStep = 5
  }

  const db = getDb()
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning()

  if (!user) return c.json({ error: 'Usuário não encontrado.' }, 404)
  return c.json({ user: toAuthUser(user) })
})

me.get('/acompanhamento', async (c) => {
  const userId = c.get('userId')
  const db = getDb()
  const rows = await db
    .select()
    .from(userAcompanhamentos)
    .where(eq(userAcompanhamentos.userId, userId))

  const items: MeuAcompanhamento[] = rows.map((row) => ({
    politicoId: row.politicoId,
    seguidoEm: row.seguidoEm,
    nota: row.nota ?? undefined,
  }))

  return c.json({ items })
})

me.put('/acompanhamento', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ items?: MeuAcompanhamento[] }>()
  const items = body.items ?? []

  if (!Array.isArray(items)) {
    return c.json({ error: 'Lista de acompanhamento inválida.' }, 400)
  }

  const db = getDb()
  await db.delete(userAcompanhamentos).where(eq(userAcompanhamentos.userId, userId))

  if (items.length > 0) {
    await db.insert(userAcompanhamentos).values(
      items.map((item) => ({
        userId,
        politicoId: item.politicoId,
        seguidoEm: item.seguidoEm,
        nota: item.nota ?? null,
      })),
    )
  }

  return c.json({ items })
})

me.post('/acompanhamento', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ politicoId?: string; nota?: string }>()
  const politicoId = body.politicoId?.trim()
  if (!politicoId) return c.json({ error: 'politicoId é obrigatório.' }, 400)

  const db = getDb()
  const seguidoEm = new Date().toISOString().slice(0, 10)

  await db
    .insert(userAcompanhamentos)
    .values({
      userId,
      politicoId,
      seguidoEm,
      nota: body.nota ?? null,
    })
    .onConflictDoUpdate({
      target: [userAcompanhamentos.userId, userAcompanhamentos.politicoId],
      set: { nota: body.nota ?? null },
    })

  const rows = await db
    .select()
    .from(userAcompanhamentos)
    .where(eq(userAcompanhamentos.userId, userId))

  const items: MeuAcompanhamento[] = rows.map((row) => ({
    politicoId: row.politicoId,
    seguidoEm: row.seguidoEm,
    nota: row.nota ?? undefined,
  }))

  return c.json({ items })
})

me.delete('/acompanhamento/:politicoId', async (c) => {
  const userId = c.get('userId')
  const politicoId = c.req.param('politicoId')
  const db = getDb()

  await db
    .delete(userAcompanhamentos)
    .where(
      and(
        eq(userAcompanhamentos.userId, userId),
        eq(userAcompanhamentos.politicoId, politicoId),
      ),
    )

  const rows = await db
    .select()
    .from(userAcompanhamentos)
    .where(eq(userAcompanhamentos.userId, userId))

  const items: MeuAcompanhamento[] = rows.map((row) => ({
    politicoId: row.politicoId,
    seguidoEm: row.seguidoEm,
    nota: row.nota ?? undefined,
  }))

  return c.json({ items })
})

me.patch('/acompanhamento/:politicoId', async (c) => {
  const userId = c.get('userId')
  const politicoId = c.req.param('politicoId')
  const body = await c.req.json<{ nota?: string }>()
  const db = getDb()

  await db
    .update(userAcompanhamentos)
    .set({ nota: body.nota ?? null })
    .where(
      and(
        eq(userAcompanhamentos.userId, userId),
        eq(userAcompanhamentos.politicoId, politicoId),
      ),
    )

  const rows = await db
    .select()
    .from(userAcompanhamentos)
    .where(eq(userAcompanhamentos.userId, userId))

  const items: MeuAcompanhamento[] = rows.map((row) => ({
    politicoId: row.politicoId,
    seguidoEm: row.seguidoEm,
    nota: row.nota ?? undefined,
  }))

  return c.json({ items })
})

me.get('/cola', async (c) => {
  const userId = c.get('userId')
  const db = getDb()
  const rows = await db.select().from(userCola).where(eq(userCola.userId, userId))

  const cola: MinhaCola = {}
  for (const row of rows) {
    cola[row.cargo as CargoEleicao2026] = {
      cargo: row.cargo as CargoEleicao2026,
      politicoId: row.politicoId,
      nome: row.nome,
      nomeUrna: row.nomeUrna,
      partido: row.partido,
      uf: row.uf,
    }
  }

  return c.json({ cola })
})

me.put('/cola', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ cola?: MinhaCola }>()
  const cola = body.cola ?? {}

  const db = getDb()
  await db.delete(userCola).where(eq(userCola.userId, userId))

  const entries = Object.entries(cola).filter(
    ([cargo, escolha]) => COLA_CARGOS.includes(cargo as CargoEleicao2026) && escolha,
  ) as [CargoEleicao2026, CandidatoCola][]

  if (entries.length > 0) {
    await db.insert(userCola).values(
      entries.map(([cargo, escolha]) => ({
        userId,
        cargo,
        politicoId: escolha.politicoId,
        nome: escolha.nome,
        nomeUrna: escolha.nomeUrna,
        partido: escolha.partido,
        uf: escolha.uf,
      })),
    )
  }

  return c.json({ cola })
})

me.put('/cola/:cargo', async (c) => {
  const userId = c.get('userId')
  const cargo = c.req.param('cargo') as CargoEleicao2026
  if (!COLA_CARGOS.includes(cargo)) {
    return c.json({ error: 'Cargo inválido.' }, 400)
  }

  const body = await c.req.json<CandidatoCola | null>()
  const db = getDb()

  if (!body) {
    await db
      .delete(userCola)
      .where(and(eq(userCola.userId, userId), eq(userCola.cargo, cargo)))
  } else {
    await db
      .insert(userCola)
      .values({
        userId,
        cargo,
        politicoId: body.politicoId,
        nome: body.nome,
        nomeUrna: body.nomeUrna,
        partido: body.partido,
        uf: body.uf,
      })
      .onConflictDoUpdate({
        target: [userCola.userId, userCola.cargo],
        set: {
          politicoId: body.politicoId,
          nome: body.nome,
          nomeUrna: body.nomeUrna,
          partido: body.partido,
          uf: body.uf,
        },
      })
  }

  const rows = await db.select().from(userCola).where(eq(userCola.userId, userId))
  const cola: MinhaCola = {}
  for (const row of rows) {
    cola[row.cargo as CargoEleicao2026] = {
      cargo: row.cargo as CargoEleicao2026,
      politicoId: row.politicoId,
      nome: row.nome,
      nomeUrna: row.nomeUrna,
      partido: row.partido,
      uf: row.uf,
    }
  }

  return c.json({ cola })
})

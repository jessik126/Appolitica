import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { getDb } from '../db/client.js'
import { users } from '../db/schema.js'
import { hashPassword, validatePassword, verifyPassword } from '../lib/password.js'
import {
  createSession,
  deleteSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '../lib/session.js'
import { toAuthUser } from '../lib/user.js'
import { normalizeEmail, validateEmail, validateName } from '../lib/validation.js'
import type { AuthVariables } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

export const auth = new Hono<{ Variables: AuthVariables }>()

const isProduction = process.env.NODE_ENV === 'production'

auth.post('/register', async (c) => {
  const body = await c.req.json<{ name?: string; email?: string; password?: string }>()
  const name = body.name?.trim() ?? ''
  const email = normalizeEmail(body.email ?? '')
  const password = body.password ?? ''

  const nameError = validateName(name)
  if (nameError) return c.json({ error: nameError }, 400)

  const emailError = validateEmail(email)
  if (emailError) return c.json({ error: emailError }, 400)

  const passwordError = validatePassword(password)
  if (passwordError) return c.json({ error: passwordError }, 400)

  const db = getDb()
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return c.json({ error: 'Este e-mail já está cadastrado.' }, 409)
  }

  const passwordHash = await hashPassword(password)
  const userId = randomUUID()

  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      name,
      email,
      passwordHash,
      onboardingStep: 0,
    })
    .returning()

  const token = await createSession(user.id)
  setCookie(c, SESSION_COOKIE, token, sessionCookieOptions(isProduction))

  return c.json({ user: toAuthUser(user) }, 201)
})

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const email = normalizeEmail(body.email ?? '')
  const password = body.password ?? ''

  const emailError = validateEmail(email)
  if (emailError) return c.json({ error: emailError }, 400)

  if (!password) return c.json({ error: 'Informe sua senha.' }, 400)

  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = rows[0]
  if (!user) {
    return c.json({ error: 'E-mail ou senha incorretos.' }, 401)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'E-mail ou senha incorretos.' }, 401)
  }

  const token = await createSession(user.id)
  setCookie(c, SESSION_COOKIE, token, sessionCookieOptions(isProduction))

  return c.json({ user: toAuthUser(user) })
})

auth.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    await deleteSession(token)
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

auth.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const user = rows[0]
  if (!user) {
    return c.json({ error: 'Usuário não encontrado.' }, 404)
  }
  return c.json({ user: toAuthUser(user) })
})
